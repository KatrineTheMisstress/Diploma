import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePageDto } from 'src/auth/dto/create-page.dto';
import { PageUpdateDTO } from './dto/pages-update.dto';
import * as fs from 'fs';
import * as path from 'path';
import * as archiver from 'archiver';

@Injectable()
export class PagesService {
  constructor(private prisma: PrismaService) {}

  async getPagesByUser(userId: string) {
    return this.prisma.page.findMany({
      where: { userId: userId },
    });
  }

  async createPage(userId: string, dto: CreatePageDto) {
    return this.prisma.page.create({
      data: {
        name: dto.name,
        userId: userId,
        page_data: [],
        global_settings: {},
      },
    });
  }

  async updatePage(data: PageUpdateDTO): Promise<Object> {
    return await this.prisma.page.update({
      where: {
        id: data.pageId,
      },
      data: {
        page_data: data.data,
      },
    });
  }

  async getBlockByType(type: string) {
    const block = await this.prisma.block.findFirst({
      where: { type },
    });

    if (!block) {
      throw new NotFoundException(`Блок с типом "${type}" не найден`);
    }

    return block;
  }

  async getAllBlocksFormatted() {
    const blocks = await this.prisma.block.findMany({
      select: {
        id: true,
        type: true,
        json_template: true,
      },
    });

    return blocks.map((block) => ({
      id: block.id,
      type: block.type,
      schema:
        typeof block.json_template === 'string'
          ? JSON.parse(block.json_template)
          : block.json_template,
    }));
  }

  async previewPage(data, pageId) {
    let HTMLResult = '';
    let HTMLStyleList = '';
    let HTMLGlobalStyles = '';
    let HTMLScripts = '';

    HTMLScripts += `<script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
<script>
  document.addEventListener("DOMContentLoaded", function () {
    new Swiper('.swiper', {
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      loop: true, 
    });
  });
</script>
`;

    const page = await this.prisma.page.findFirstOrThrow({
      where: {
        id: pageId,
      },
    });
    HTMLGlobalStyles =
      page.global_settings?.['global-styles']?.toLocaleString() ??
      `body {padding: 20%; font-family: "Inter"}`;

    const addedBlockTypes = new Set();

    for (let oneData of data) {
      if (oneData.type === 'zero-block') {
        HTMLResult += oneData.data.code;
        continue;
      }
      const block = await this.prisma.block.findFirstOrThrow({
        where: {
          type: oneData.type,
        },
      });

      HTMLResult += await this.renderTemplateFromDb(
        oneData.data,
        block.html_template,
        oneData.type,
      );

      if (!addedBlockTypes.has(block.type)) {
        HTMLStyleList += block.styles;
        addedBlockTypes.add(block.type);
      }
    }

    return (
      '<head>' +
      '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css" />' +
      '</head>' +
      '<body>' +
      HTMLResult +
      '<style>' +
      HTMLGlobalStyles +
      HTMLStyleList +
      '</style>' +
      '<script>' +
      HTMLScripts +
      '</script>' +
      '<body>'
    );
  }

  async renderTemplateFromDb(
    data: Record<string, any>,
    templateHTML: string,
    type?: string,
  ): Promise<string> {
    const template = templateHTML;

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    // Обработка слайдера
    if (type === 'Слайдер' && Array.isArray(data.images)) {
      const slides = data.images
        .map((url) => `<div class="swiper-slide"><img src="${url}" /></div>`)
        .join('\n');

      return templateHTML.replace('{slides}', slides);
    }
    if ((type === 'grid2' || type === 'grid3') && Array.isArray(data.images)) {
      const columns = type === 'grid2' ? 2 : 3;
      const gridItems = data.images
        .map(
          (url) =>
            `<div class="grid-item"><img src="${url}" style="width:100%; height:auto; object-fit:cover;" /></div>`,
        )
        .join('\n');

      return `
      <div class="grid grid-cols-${columns} gap-4">
        ${gridItems}
      </div>
    `;
    }

    return this.applyTemplate(template, data);
  }

  async savePage(data) {
    const page = await this.prisma.page.update({
      where: {
        id: data.pageId,
      },
      data: {
        page_data: data,
      },
    });
    return { message: 'OK' };
  }

  async applyTemplate(template: string, data: Record<string, any>) {
    return template.replace(/{(\w+)}/g, (_, key) => {
      return key in data ? data[key] : `{${key}}`;
    });
  }

  async GetPageInfo(id: string) {
    return await this.prisma.page.findFirstOrThrow({
      where: {
        id: id,
      },
    });
  }

  async saveGlobalSettings(data: any) {
    const styleString = data['global-styles'];
    const id = data.id;

    if (!id || typeof styleString !== 'string') {
      throw new Error('Отсутствует id или некорректный формат стилей');
    }

    return this.prisma.page.update({
      where: { id },
      data: {
        global_settings: { 'global-styles': styleString },
      },
    });
  }

  async downloadArchive(pageId: string): Promise<Buffer> {
    const tmpDir = path.join(__dirname, '../../tmp');

    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    const pageDataraw = await this.prisma.page.findFirst({
      where: { id: pageId },
    });

    const pageData = await this.buildPage(pageDataraw.page_data, pageId);
    const htmlContent = pageData.head + pageData.body + pageData.scripts;
    const cssContent = pageData.styles + pageData.globalStyles;

    const tempZipPath = path.join(tmpDir, `${pageId}.zip`);

    if (fs.existsSync(tempZipPath)) {
      fs.unlinkSync(tempZipPath);
    }

    const output = fs.createWriteStream(tempZipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    const archiveDone = new Promise<Buffer>((resolve, reject) => {
      output.on('close', () => {
        const buffer = fs.readFileSync(tempZipPath);
        resolve(buffer);
      });
      archive.on('error', (err) => reject(err));
    });

    archive.pipe(output);
    archive.append(htmlContent, { name: 'index.html' });
    archive.append(cssContent, { name: 'styles.css' });
    archive.finalize();

    return archiveDone;
  }

  async buildPage(data, pageId) {
    let HTMLResult = '';
    let HTMLStyleList = '';
    let HTMLGlobalStyles = '';
    let HTMLScripts = '';

    HTMLScripts += `<script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
<script>
  document.addEventListener("DOMContentLoaded", function () {
    new Swiper('.swiper', {
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      loop: true, 
    });
  });
</script>
`;
    const page = await this.prisma.page.findFirstOrThrow({
      where: {
        id: pageId,
      },
    });
    HTMLGlobalStyles =
      page.global_settings?.['global-styles']?.toLocaleString() ??
      `body {padding: 20%; font-family: "Inter"}`;

    const addedBlockTypes = new Set();

    for (let oneData of data.data) {
      if (oneData.type == 'zero-block') {
        HTMLResult += oneData.data.code;
        continue;
      }

      const block = await this.prisma.block.findFirst({
        where: {
          type: oneData.type,
        },
      });
      if (!block) {
        continue;
      }

      HTMLResult += await this.renderTemplateFromDb(
        oneData.data,
        block.html_template,
        oneData.type,
      );

      if (!addedBlockTypes.has(block.type)) {
        HTMLStyleList += block.styles;
        addedBlockTypes.add(block.type);
      }
    }

    return {
      head: '<link rel="stylesheet" href="styles.css" />',
      body: HTMLResult,
      styles: HTMLStyleList,
      globalStyles: HTMLGlobalStyles,
      scripts: HTMLScripts,
    };
  }
  async getAllBlocks(): Promise<any[]> {
    const blocks = await this.prisma.block.findMany({
      orderBy: { id: 'asc' },
    });

    return blocks.map((block) => ({
      id: block.id,
      type: block.type,
      html_template: block.html_template,
      styles: block.styles,
      json_template: block.json_template,
    }));
  }

  async createBlocks(
    data: {
      type: string;
      html_template?: string;
      styles?: string;
      json_template: string | object[];
    }[],
  ) {
    const formattedData = data.map((block) => ({
      type: block.type,
      html_template: block.html_template || '',
      styles: block.styles || '',
      json_template: JSON.stringify(
        typeof block.json_template === 'string'
          ? JSON.parse(block.json_template)
          : block.json_template,
      ),
    }));

    return this.prisma.block.createMany({
      data: formattedData,
    });
  }

  async updateBlocks(
    data: {
      id: string;
      type: string;
      html_template?: string;
      styles?: string;
      json_template: string | object[];
    }[],
  ) {
    const updatePromises = data.map(
      async (block) =>
        await this.prisma.block.update({
          where: { id: block.id },
          data: {
            type: block.type,
            html_template: block.html_template || '',
            styles: block.styles || '',
            json_template: JSON.stringify(
              typeof block.json_template === 'string'
                ? JSON.parse(block.json_template)
                : block.json_template,
            ),
          },
        }),
    );

    return Promise.all(updatePromises);
  }

  async saveBlocks(data: any[]): Promise<{ message: string }> {
    for (const block of data) {
      const { id, type, html_template, styles, json_template } = block;

      if (!type || !html_template || !styles || !json_template) {
        throw new Error(`Неполные данные для блока: ${JSON.stringify(block)}`);
      }

      // Обновление, если есть ID, иначе — создание
      if (id) {
        await this.prisma.block.update({
          where: { id },
          data: { type, html_template, styles, json_template },
        });
      } else {
        await this.prisma.block.create({
          data: { type, html_template, styles, json_template },
        });
      }
    }

    return { message: 'Сохранено успешно' };
  }
}

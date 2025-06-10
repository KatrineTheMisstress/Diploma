import {
  Controller,
  Get,
  UseGuards,
  Req,
  Post,
  Body,
  Param,
  Res,
} from '@nestjs/common';
import { PagesService } from './pages.service';
import { CurrentUser } from 'src/customDecorators/current-user.decorator';
import { CreatePageDto } from 'src/auth/dto/create-page.dto';
import { JwtPayload } from 'src/interfaces/jwt-payload.interface';
import { PageUpdateDTO } from './dto/pages-update.dto';
import passport from 'passport';
import { PagePreviewDTO } from './dto/pages-preview.dto';
import { Response } from 'express';
import { Public } from 'src/customDecorators/public.decorator';

@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Get('my')
  async getMyPages(@Req() req) {
    const userId = req.user.id;
    return this.pagesService.getPagesByUser(userId);
  }

  @Post()
  async createPage(@Req() req, @Body() dto: CreatePageDto) {
    const userId = req.user.id;
    return await this.pagesService.createPage(userId, dto);
  }

  @Post('update-structure')
  async updateStructure(@Body() data: PageUpdateDTO) {
    return await this.pagesService.updatePage(data);
  }

  @Post('preview')
  async getPreview(@Body() data: PagePreviewDTO) {
    return await this.pagesService.previewPage(data.data, data.pageId);
  }

  @Get('type')
  getBlockByType(@Body('type') type: string) {
    return this.pagesService.getBlockByType(type);
  }

  @Get('all-blocks')
  async getAllBlocks() {
    return await this.pagesService.getAllBlocksFormatted();
  }

  @Post('save')
  async save(@Body() data: any) {
    return await this.pagesService.savePage(data);
  }

  @Get('one/:id')
  async getPage(@Param('id') id: string) {
    return await this.pagesService.GetPageInfo(id);
  }

  @Post('save/global-settings')
  async updateGlobalSettings(@Body() body: any) {
    return this.pagesService.saveGlobalSettings(body);
  }

  @Public()
  @Get(':id/download')
  async download(@Param('id') id: string, @Res() res: Response) {
    const zipBuffer = await this.pagesService.downloadArchive(id);

    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="project-${id}.zip"`,
      'Content-Length': zipBuffer.length,
    });

    res.end(zipBuffer);
  }

  @Get('/blocks')
  getBlocks() {
    return this.pagesService.getAllBlocks();
  }

  @Post('/save/blocks')
  saveBlocks(@Body() body: any) {
    return this.pagesService.saveBlocks(body);
  }

  @Post('blocks/create')
  createBlocks(@Body() data: any[]) {
    return this.pagesService.createBlocks(data);
  }

  @Post('blocks/update')
  updateBlocks(@Body() data: any[]) {
    console.log(data);
    return this.pagesService.updateBlocks(data);
  }
}

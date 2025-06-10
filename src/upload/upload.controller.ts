import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as path from 'path';

import { Express } from 'express'; // 👈 добавлено для корректной типизации
import * as fs from 'fs';
import { Response } from 'express';
import { Public } from 'src/customDecorators/public.decorator';

@Controller('upload')
export class UploadController {
  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `image-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return {
      imageUrl: `http://localhost:3000/api/upload/get_image/${file.filename}`,
    };
  }

  @Public()
  @Get('get_image/:image_src')
  async GetImage(@Param('image_src') imageSrc: string, @Res() res: Response) {
    const sanitizedPath = imageSrc.replace(/^\/+/, '');
    const filePath = path.join(process.cwd(), 'uploads', sanitizedPath);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Файл не найден');
    }

    return res.sendFile(filePath);
  }
}

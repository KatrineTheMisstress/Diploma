import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { BlocksModule } from './blocks/blocks.module';
import { UploadController } from './upload/upload.controller';
import { UploadModule } from './upload/upload.module';
import { PagesService } from './pages/pages.service';
import { PagesController } from './pages/pages.controller';
import { BlocksService } from './blocks/blocks.service';
import { PagesModule } from './pages/pages.module';

@Module({
  imports: [AuthModule, UsersModule, PrismaModule, BlocksModule, UploadModule, PagesModule],
  controllers: [AppController, UploadController, PagesController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    PagesService,
    BlocksService,
  ],
})
export class AppModule {}

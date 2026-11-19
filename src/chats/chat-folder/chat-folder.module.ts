import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { AuthModule } from '../../auth/auth.module.js';
import { HttpModule } from '@nestjs/axios';
import { ChatFolderService } from './chat-folder.service.js';
import { ChatFolderController } from './chat-folder.controller.js';

@Module({
  imports: [PrismaModule, AuthModule, HttpModule],
  providers: [ChatFolderService],
  controllers: [ChatFolderController],
})
export class ChatFolderModule {}

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { PrismaModule } from '../../prisma/prisma.module.js';
import { AuthModule } from '../../auth/auth.module.js';
import { ChatsModule } from '../chats/chats.module.js';
import { ChatManagenentModule } from '../chat-managenent/chat-managenent.module.js';

import { ChatFolderService } from './chat-folder.service.js';
import { ChatFolderController } from './chat-folder.controller.js';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    HttpModule,
    ChatManagenentModule,
    ChatsModule,
  ],
  providers: [ChatFolderService],
  controllers: [ChatFolderController],
})
export class ChatFolderModule {}

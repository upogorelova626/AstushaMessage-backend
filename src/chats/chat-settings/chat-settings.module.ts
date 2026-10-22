import { Module } from '@nestjs/common';

import { AuthModule } from '../../auth/auth.module.js';
import { PrismaModule } from '../../prisma/prisma.module.js';

import { UsersService } from '../../users/users/users.service.js';
import { HttpModule } from '@nestjs/axios';
import { ChatSettingsService } from './chat-settings.service.js';
import { ChatSettingsController } from './chat-settings.controller.js';
import { ChatsService } from '../chats/chats.service.js';

@Module({
  imports: [PrismaModule, AuthModule, HttpModule],
  controllers: [ChatSettingsController],
  providers: [ChatSettingsService, UsersService, ChatsService],
})
export class ChatSettingsModule {}

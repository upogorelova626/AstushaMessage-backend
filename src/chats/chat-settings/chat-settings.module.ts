import { Module } from '@nestjs/common';

import { AuthModule } from '../../auth/auth.module.js';
import { PrismaModule } from '../../prisma/prisma.module.js';

import { UsersService } from '../../users/users/users.service.js';
import { HttpModule } from '@nestjs/axios';
import { ChatSettingsService } from './chat-settings.service.js';
import { ChatSettingsController } from './chat-settings.controller.js';

@Module({
  imports: [PrismaModule, AuthModule, HttpModule],
  controllers: [ChatSettingsController],
  providers: [ChatSettingsService, UsersService],
})
export class ChatSettingsModule {}

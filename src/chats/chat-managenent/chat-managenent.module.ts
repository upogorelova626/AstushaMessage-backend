import { Module } from '@nestjs/common';
import { ChatManagementService } from './chat-management.service.js';
import { ChatManagenentController } from './chat-managenent.controller.js';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { AuthModule } from '../../auth/auth.module.js';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [PrismaModule, AuthModule, HttpModule],
  providers: [ChatManagementService],
  controllers: [ChatManagenentController],
})
export class ChatManagenentModule {}

import { Module } from '@nestjs/common';
import { ChatManagementService } from './chat-management.service.js';
import { ChatManagenentController } from './chat-managenent.controller.js';

@Module({
  providers: [ChatManagementService],
  controllers: [ChatManagenentController],
})
export class ChatManagenentModule {}

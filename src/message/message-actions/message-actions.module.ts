import { Module } from '@nestjs/common';
import { MessageActionsController } from './message-actions.controller.js';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { AuthModule } from '../../auth/auth.module.js';
import { HttpModule } from '@nestjs/axios';
import { MessageActionsService } from './message-actions.service.js';

@Module({
  controllers: [MessageActionsController],
  imports: [PrismaModule, AuthModule, HttpModule],
  providers: [MessageActionsService],
})
export class MessageActionsModule {}

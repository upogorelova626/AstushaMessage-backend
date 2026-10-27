import { Module } from '@nestjs/common';
import { MessageService } from './message.service.js';
import { MessageController } from './message.controller.js';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { AuthModule } from '../../auth/auth.module.js';
import { HttpModule } from '@nestjs/axios';

@Module({
  providers: [MessageService],
  imports: [PrismaModule, AuthModule, HttpModule],
  controllers: [MessageController],
})
export class MessageModule {}

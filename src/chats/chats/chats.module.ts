import { Module } from '@nestjs/common';

import { AuthModule } from '../../auth/auth.module.js';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { ChatsController } from './chats.controller.js';
import { ChatsService } from './chats.service.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ChatsController],
  providers: [ChatsService],
})
export class ChatsModule {}

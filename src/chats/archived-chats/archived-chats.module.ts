import { Module } from '@nestjs/common';
import { ArchivedChatsService } from './archived-chats.service.js';
import { ArchivedChatsController } from './archived-chats.controller.js';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { AuthModule } from '../../auth/auth.module.js';
import { HttpModule } from '@nestjs/axios';
import { UsersService } from '../../users/users/users.service.js';

@Module({
  imports: [PrismaModule, AuthModule, HttpModule],
  providers: [ArchivedChatsService, UsersService],
  controllers: [ArchivedChatsController],
})
export class ArchivedChatsModule {}

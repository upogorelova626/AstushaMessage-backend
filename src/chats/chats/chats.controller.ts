import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { ChatsService } from './chats.service.js';
import { CreateChatDto } from '../dto/create-chat.dto.js';
import type { AuthenticatedRequest } from '../../auth/types/authenticated-request.type.js';

@Controller('chats')
@ApiTags('Chats')
@ApiCookieAuth('accessToken')
@UseGuards(JwtAuthGuard)
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post()
  @ApiOperation({ summary: 'Создать новый чат' })
  @ApiCreatedResponse({
    description: 'Чат успешно создан',
  })
  create(@Req() request: AuthenticatedRequest, @Body() dto: CreateChatDto) {
    return this.chatsService.createNewChat(request.user.id, dto);
  }
}

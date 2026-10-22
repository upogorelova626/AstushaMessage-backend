import {
  Controller,
  Delete,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import type { AuthenticatedRequest } from '../../auth/types/authenticated-request.type.js';
import { ChatManagementService } from './chat-management.service.js';

@Controller('chat-managenent')
@ApiTags('Chat Management')
@ApiCookieAuth('accessToken')
@ApiParam({
  name: 'chatId',
  description: 'UUID чата',
  type: String,
  format: 'uuid',
})
@ApiResponse({
  status: 401,
  description: 'Пользователь не авторизован',
})
@ApiResponse({
  status: 404,
  description: 'Чат не найден или пользователь не является его участником',
})
@UseGuards(JwtAuthGuard)
export class ChatManagenentController {
  constructor(private readonly chatManagementService: ChatManagementService) {}

  @Delete(':chatId')
  @HttpCode(204)
  deleteChat(
    @Req() request: AuthenticatedRequest,
    @Param('chatId', ParseUUIDPipe) chatId: string,
  ) {
    return this.chatManagementService.removeChat(request.user.id, chatId, true);
  }

  @Delete(':chatId/messages')
  @HttpCode(204)
  clearChat(
    @Req() request: AuthenticatedRequest,
    @Param('chatId', ParseUUIDPipe) chatId: string,
  ) {
    return this.chatManagementService.removeChat(
      request.user.id,
      chatId,
      false,
    );
  }
}

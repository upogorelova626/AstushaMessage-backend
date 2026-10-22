import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { ChatSettingsService } from './chat-settings.service.js';
import { ArchiveChatDto } from '../dto/archive.chat.dto.js';
import { PinChatDto } from '../dto/pine.chat.dto.js';
import { FavoriteChatDto } from '../dto/favourite.chat.dto.js';
import { MuteChatDto } from '../dto/mute.chat.dto.js';
import { AuthenticatedRequest } from '../../auth/types/authenticated-request.type.js';

@Controller('chat-settings')
@ApiTags('Chat Settings')
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
export class ChatSettingsController {
  constructor(private readonly chatSettingsService: ChatSettingsService) {}

  @Patch(':chatId/archive')
  @ApiOperation({
    summary: 'Архивировать или разархивировать чат',
  })
  @ApiBody({ type: ArchiveChatDto })
  @ApiResponse({
    status: 200,
    description: 'Статус архивации успешно обновлён',
  })
  @ApiResponse({
    status: 400,
    description: 'Некорректные данные запроса',
  })
  archiveChat(
    @Req() request: AuthenticatedRequest & { user: { id: string } },
    @Param('chatId', ParseUUIDPipe) chatId: string,
    @Body() dto: ArchiveChatDto,
  ) {
    return this.chatSettingsService.updateChatSetting(
      request.user.id,
      chatId,
      'isArchived',
      dto.isArchived,
      request.headers.cookie,
    );
  }

  @Patch(':chatId/pin')
  @ApiOperation({
    summary: 'Закрепить или открепить чат',
  })
  @ApiBody({ type: PinChatDto })
  @ApiResponse({
    status: 200,
    description: 'Статус закрепления успешно обновлён',
  })
  @ApiResponse({
    status: 400,
    description: 'Некорректные данные запроса',
  })
  pinChat(
    @Req() request: AuthenticatedRequest & { user: { id: string } },
    @Param('chatId', ParseUUIDPipe) chatId: string,
    @Body() dto: PinChatDto,
  ) {
    return this.chatSettingsService.updateChatSetting(
      request.user.id,
      chatId,
      'isPinned',
      dto.isPinned,
      request.headers.cookie,
    );
  }

  @Patch(':chatId/favorite')
  @ApiOperation({
    summary: 'Добавить чат в избранное или удалить из избранного',
  })
  @ApiBody({ type: FavoriteChatDto })
  @ApiResponse({
    status: 200,
    description: 'Статус избранного успешно обновлён',
  })
  @ApiResponse({
    status: 400,
    description: 'Некорректные данные запроса',
  })
  favoriteChat(
    @Req() request: AuthenticatedRequest & { user: { id: string } },
    @Param('chatId', ParseUUIDPipe) chatId: string,
    @Body() dto: FavoriteChatDto,
  ) {
    return this.chatSettingsService.updateChatSetting(
      request.user.id,
      chatId,
      'isFavorite',
      dto.isFavorite,
      request.headers.cookie,
    );
  }

  @Patch(':chatId/mute')
  @ApiOperation({
    summary: 'Включить или отключить уведомления чата',
    description: 'Поддерживается отключение на 8 часов, 1 неделю или навсегда.',
  })
  @ApiBody({ type: MuteChatDto })
  @ApiResponse({
    status: 200,
    description: 'Настройки уведомлений успешно обновлены',
  })
  @ApiResponse({
    status: 400,
    description: 'Некорректный период отключения уведомлений',
  })
  muteChat(
    @Req() request: AuthenticatedRequest & { user: { id: string } },
    @Param('chatId', ParseUUIDPipe) chatId: string,
    @Body() dto: MuteChatDto,
  ) {
    return this.chatSettingsService.muteChat(
      request.user.id,
      chatId,
      dto.isMuted,
      dto.duration,
      request.headers.cookie,
    );
  }
}

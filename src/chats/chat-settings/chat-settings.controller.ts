import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { ChatSettingsService } from './chat-settings.service.js';
import { ArchiveChatDto } from '../dto/archive.chat.dto.js';
import { PinChatDto } from '../dto/pine.chat.dto.js';
import { FavoriteChatDto } from '../dto/favourite.chat.dto.js';
import { MuteChatDto } from '../dto/mute.chat.dto.js';

@Controller('chat-settings')
@ApiTags('Cha-settings')
@ApiCookieAuth('accessToken')
@UseGuards(JwtAuthGuard)
export class ChatSettingsController {
  constructor(private readonly chatSettingsService: ChatSettingsService) {}

  @Patch(':chatId/archive')
  archiveChat(
    @Req() request: Request & { user: { id: string } },
    @Param('chatId', ParseUUIDPipe) chatId: string,
    @Body() dto: ArchiveChatDto,
  ) {
    return this.chatSettingsService.updateChatSetting(
      request.user.id,
      chatId,
      'isArchived',
      dto.isArchived,
    );
  }

  @Patch(':chatId/pin')
  pinChat(
    @Req() request: Request & { user: { id: string } },
    @Param('chatId', ParseUUIDPipe) chatId: string,
    @Body() dto: PinChatDto,
  ) {
    return this.chatSettingsService.updateChatSetting(
      request.user.id,
      chatId,
      'isPinned',
      dto.isPinned,
    );
  }

  @Patch(':chatId/favorite')
  favoriteChat(
    @Req() request: Request & { user: { id: string } },
    @Param('chatId', ParseUUIDPipe) chatId: string,
    @Body() dto: FavoriteChatDto,
  ) {
    return this.chatSettingsService.updateChatSetting(
      request.user.id,
      chatId,
      'isFavorite',
      dto.isFavorite,
    );
  }

  @Patch(':chatId/mute')
  muteChat(
    @Req() request: Request & { user: { id: string } },
    @Param('chatId', ParseUUIDPipe) chatId: string,
    @Body() dto: MuteChatDto,
  ) {
    return this.chatSettingsService.muteChat(
      request.user.id,
      chatId,
      dto.isMuted,
      dto.duration,
    );
  }
}

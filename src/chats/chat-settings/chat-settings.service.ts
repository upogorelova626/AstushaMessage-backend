import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { MuteDuration } from '../dto/mute.chat.dto.js';
import { ChatsService } from '../chats/chats.service.js';

type ChatSetting = 'isArchived' | 'isPinned' | 'isFavorite';

@Injectable()
export class ChatSettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly chat: ChatsService,
  ) {}

  async updateChatSetting(
    currentUserId: string,
    chatId: string,
    setting: ChatSetting,
    value: boolean,
    cookie?: string,
  ) {
    const participant = await this.prisma.chatParticipant.findUnique({
      where: {
        chatId_userId: {
          chatId,
          userId: currentUserId,
        },
      },
    });

    if (!participant) {
      throw new NotFoundException('Чат не найден');
    }

    await this.prisma.chatParticipant.update({
      where: {
        chatId_userId: {
          chatId,
          userId: currentUserId,
        },
      },
      data: {
        [setting]: value,
      },
    });

    return this.chat.getChatById(currentUserId, chatId, cookie);
  }

  async muteChat(
    currentUserId: string,
    chatId: string,
    isMuted: boolean,
    duration?: MuteDuration,
    cookie?: string,
  ) {
    const participant = await this.prisma.chatParticipant.findUnique({
      where: {
        chatId_userId: {
          chatId,
          userId: currentUserId,
        },
      },
    });

    if (!participant) {
      throw new NotFoundException('Чат не найден');
    }

    let mutedUntil: Date | null = null;

    if (isMuted) {
      if (!duration) {
        throw new BadRequestException('Укажите время отключения уведомлений');
      }

      const now = Date.now();

      switch (duration) {
        case MuteDuration.EIGHT_HOURS:
          mutedUntil = new Date(now + 8 * 60 * 60 * 1000);
          break;

        case MuteDuration.ONE_WEEK:
          mutedUntil = new Date(now + 7 * 24 * 60 * 60 * 1000);
          break;

        case MuteDuration.FOREVER:
          mutedUntil = null;
          break;
      }
    }

    await this.prisma.chatParticipant.update({
      where: {
        chatId_userId: {
          chatId,
          userId: currentUserId,
        },
      },
      data: {
        isMuted,
        mutedUntil,
      },
    });

    return this.chat.getChatById(currentUserId, chatId, cookie);
  }
}

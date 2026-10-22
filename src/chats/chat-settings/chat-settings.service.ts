import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { MuteDuration } from '../dto/mute.chat.dto.js';

type ChatSetting = 'isArchived' | 'isPinned' | 'isFavorite';

@Injectable()
export class ChatSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async updateChatSetting(
    currentUserId: string,
    chatId: string,
    setting: ChatSetting,
    value: boolean,
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

    return this.prisma.chatParticipant.update({
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
  }

  async muteChat(
    currentUserId: string,
    chatId: string,
    isMuted: boolean,
    duration?: MuteDuration,
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

    return this.prisma.chatParticipant.update({
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
  }
}

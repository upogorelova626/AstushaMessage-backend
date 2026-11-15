import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service.js';
import { PinMessageDuration } from '../dto/pin-message.dto.js';

@Injectable()
export class MessageActionsService {
  constructor(private readonly prisma: PrismaService) {}

  async pinMessage(
    userId: string,
    chatId: string,
    messageId: string,
    duration: PinMessageDuration,
  ) {
    await this.getChatParticipant(userId, chatId);

    const message = await this.prisma.message.findFirst({
      where: {
        id: messageId,
        chatId,
        deletedAt: null,
      },
    });

    if (!message) {
      throw new NotFoundException('Сообщение не найдено');
    }

    const now = new Date();
    const pinnedUntil = this.calculatePinnedUntil(duration, now);

    return this.prisma.$transaction(async (tx) => {
      const pinnedCount = await tx.messagePin.count({
        where: {
          chatId,
          messageId: { not: messageId },
          expiresAt: { gt: now },
          message: {
            deletedAt: null,
          },
        },
      });

      if (pinnedCount >= 4) {
        throw new BadRequestException('Нельзя закрепить больше 4 сообщений');
      }

      await tx.messagePin.upsert({
        where: { messageId },
        create: {
          messageId,
          chatId,
          pinnedById: userId,
          pinnedAt: now,
          expiresAt: pinnedUntil,
        },
        update: {
          pinnedById: userId,
          pinnedAt: now,
          expiresAt: pinnedUntil,
        },
      });

      return tx.message.update({
        where: { id: message.id },
        data: {
          isPinned: true,
          pinnedAt: now,
          pinnedUntil,
          pinnedById: userId,
        },
      });
    });
  }

  async unpinMessage(userId: string, chatId: string, messageId: string) {
    await this.getChatParticipant(userId, chatId);

    const message = await this.prisma.message.findFirst({
      where: {
        id: messageId,
        chatId,
        deletedAt: null,
      },
    });

    if (!message) {
      throw new NotFoundException('Сообщение не найдено');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.messagePin.deleteMany({
        where: {
          messageId: message.id,
          chatId,
        },
      });

      return tx.message.update({
        where: {
          id: message.id,
          deletedAt: null,
        },
        data: {
          isPinned: false,
          pinnedAt: null,
          pinnedUntil: null,
          pinnedById: null,
        },
      });
    });
  }

  async updateMessageFavoriteStatus(
    userId: string,
    chatId: string,
    messageId: string,
    isFavorite: boolean,
  ) {
    await this.getChatParticipant(userId, chatId);

    const message = await this.prisma.message.findFirst({
      where: {
        id: messageId,
        chatId,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!message) {
      throw new NotFoundException('Сообщение не найдено');
    }

    const where = {
      messageId_userId: {
        messageId,
        userId,
      },
    };

    if (isFavorite) {
      await this.prisma.messageFavorite.upsert({
        where,
        create: {
          messageId,
          userId,
        },
        update: {},
      });
    } else {
      await this.prisma.messageFavorite.deleteMany({
        where: {
          messageId,
          userId,
        },
      });
    }

    return {
      messageId,
      isFavorite,
    };
  }

  private calculatePinnedUntil(duration: PinMessageDuration, now: Date): Date {
    const durations = {
      [PinMessageDuration.OneDay]: 24 * 60 * 60 * 1000,
      [PinMessageDuration.SevenDays]: 7 * 24 * 60 * 60 * 1000,
      [PinMessageDuration.ThirtyDays]: 30 * 24 * 60 * 60 * 1000,
    };

    return new Date(now.getTime() + durations[duration]);
  }

  private async getChatParticipant(userId: string, chatId: string) {
    const participant = await this.prisma.chatParticipant.findUnique({
      where: {
        chatId_userId: {
          chatId,
          userId,
        },
      },
    });

    if (!participant || participant.deletedAt) {
      throw new NotFoundException('Чат не найден');
    }

    return participant;
  }
}

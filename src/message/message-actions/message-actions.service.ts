import { Injectable, NotFoundException } from '@nestjs/common';
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

    return this.prisma.message.update({
      where: { id: message.id },
      data: {
        isPinned: true,
        pinnedAt: now,
        pinnedUntil: this.calculatePinnedUntil(duration, now),
        pinnedById: userId,
      },
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

    return this.prisma.message.update({
      where: { id: message.id, chatId, deletedAt: null },
      data: {
        isPinned: false,
        pinnedAt: null,
        pinnedUntil: null,
        pinnedById: null,
      },
    });
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

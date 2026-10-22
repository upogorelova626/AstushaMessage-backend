import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class ChatManagementService {
  constructor(private readonly prisma: PrismaService) {}

  async removeChat(currentUserId: string, chatId: string, isDelete: boolean) {
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

    const currentDate = new Date();

    await this.prisma.chatParticipant.update({
      where: {
        chatId_userId: {
          chatId,
          userId: currentUserId,
        },
      },
      data: {
        ...(isDelete && { deletedAt: currentDate }),
        clearedAt: currentDate,
      },
    });
  }
}

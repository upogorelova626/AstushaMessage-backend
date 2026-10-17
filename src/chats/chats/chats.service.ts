import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateChatDto } from '../dto/create-chat.dto.js';

@Injectable()
export class ChatsService {
  constructor(private readonly prisma: PrismaService) {}

  async createNewChat(currentUserId: string, dto: CreateChatDto) {
    const recipientId = dto.userId;

    if (currentUserId === recipientId) {
      throw new BadRequestException('Нельзя создать чат с самим собой');
    }

    const privateKey = [currentUserId, recipientId].sort().join(':');

    const existingChat = await this.prisma.chat.findUnique({
      where: {
        privateKey,
      },
      include: {
        participants: true,
      },
    });

    if (existingChat) {
      return existingChat;
    }

    try {
      return await this.prisma.chat.create({
        data: {
          privateKey,
          participants: {
            create: [{ userId: currentUserId }, { userId: recipientId }],
          },
        },
        include: {
          participants: true,
        },
      });
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        const chat = await this.prisma.chat.findUnique({
          where: {
            privateKey,
          },
          include: {
            participants: true,
          },
        });

        if (chat) {
          return chat;
        }
      }

      throw error;
    }
  }

  async getAllChats(currentUserId: string) {
    const chats = await this.prisma.chat.findMany({
      where: {
        participants: {
          some: {
            userId: currentUserId,
          },
        },
      },

      include: {
        participants: true,
      },
    });

    return chats;
  }

  async getChatById(currentUserId: string, chatId: string) {
    const chat = await this.prisma.chat.findFirst({
      where: {
        id: chatId,
        participants: {
          some: {
            userId: currentUserId,
          },
        },
      },
      include: {
        participants: true,
      },
    });

    if (!chat) {
      throw new NotFoundException('Чат не найден');
    }

    return chat;
  }
}

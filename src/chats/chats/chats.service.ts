import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateChatDto } from '../dto/create-chat.dto.js';
import { UsersService } from '../../users/users/users.service.js';

@Injectable()
export class ChatsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

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

  async getAllChats(currentUserId: string, cookie?: string) {
    const chats = await this.prisma.chat.findMany({
      where: {
        participants: {
          some: {
            userId: currentUserId,
          },
        },
      },
      select: {
        id: true,
        type: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        participants: {
          select: {
            userId: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    if (!chats.length) {
      return [];
    }

    const userIds = [
      ...new Set(
        chats.flatMap((chat) =>
          chat.participants.map((participant) => participant.userId),
        ),
      ),
    ];

    const users = await this.usersService.getUsersByIds(userIds, cookie);

    const usersMap = new Map(users.map((user) => [user.id, user]));

    return chats.map((chat) => ({
      ...chat,
      participants: chat.participants.map((participant) => {
        const user = usersMap.get(participant.userId);

        return {
          ...participant,
          user: user
            ? {
                id: user.id,
                login: user.login,
                firstName: user.firstName,
                lastName: user.lastName,
                avatarUrl: user.avatarUrl,
              }
            : null,
        };
      }),
    }));
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

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

  async createNewChat(
    currentUserId: string,
    dto: CreateChatDto,
    cookie?: string,
  ) {
    const recipientId = dto.userId;

    if (currentUserId === recipientId) {
      throw new BadRequestException('Нельзя создать чат с самим собой');
    }

    const privateKey = [currentUserId, recipientId].sort().join(':');

    const existingChat = await this.prisma.chat.findUnique({
      where: {
        privateKey,
      },
      select: {
        id: true,
      },
    });

    if (existingChat) {
      await this.restoreChat(currentUserId, existingChat.id);

      return this.getChatById(currentUserId, existingChat.id, cookie);
    }

    try {
      const chat = await this.prisma.chat.create({
        data: {
          privateKey,
          participants: {
            create: [{ userId: currentUserId }, { userId: recipientId }],
          },
        },
        select: {
          id: true,
        },
      });

      return this.getChatById(currentUserId, chat.id, cookie);
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
          select: {
            id: true,
          },
        });

        if (chat) {
          await this.restoreChat(currentUserId, chat.id);

          return this.getChatById(currentUserId, chat.id, cookie);
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
            isArchived: false,
            deletedAt: null,
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
            isArchived: true,
            isPinned: true,
            isFavorite: true,
            isMuted: true,
            mutedUntil: true,
            isMarkedUnread: true,
            lastReadAt: true,
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

    return chats.map((chat) => {
      const currentParticipant = chat.participants.find(
        (participant) => participant.userId === currentUserId,
      );

      return {
        ...chat,
        settings: currentParticipant
          ? {
              isArchived: currentParticipant.isArchived,
              isPinned: currentParticipant.isPinned,
              isFavorite: currentParticipant.isFavorite,
              isMuted: currentParticipant.isMuted,
              mutedUntil: currentParticipant.mutedUntil,
              isMarkedUnread: currentParticipant.isMarkedUnread,
              lastReadAt: currentParticipant.lastReadAt,
            }
          : null,
        participants: chat.participants.map((participant) => {
          const user = usersMap.get(participant.userId);

          return {
            userId: participant.userId,
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
      };
    });
  }

  async getChatById(currentUserId: string, chatId: string, cookie?: string) {
    const chat = await this.prisma.chat.findFirst({
      where: {
        id: chatId,
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
            isArchived: true,
            isPinned: true,
            isFavorite: true,
            isMuted: true,
            mutedUntil: true,
            isMarkedUnread: true,
            lastReadAt: true,
          },
        },
      },
    });

    if (!chat) {
      throw new NotFoundException('Чат не найден');
    }

    const userIds = [
      ...new Set(chat.participants.map((participant) => participant.userId)),
    ];

    const users = await this.usersService.getUsersByIds(userIds, cookie);

    const usersMap = new Map(users.map((user) => [user.id, user]));

    const currentParticipant = chat.participants.find(
      (participant) => participant.userId === currentUserId,
    );

    return {
      ...chat,
      settings: currentParticipant
        ? {
            isArchived: currentParticipant.isArchived,
            isPinned: currentParticipant.isPinned,
            isFavorite: currentParticipant.isFavorite,
            isMuted: currentParticipant.isMuted,
            mutedUntil: currentParticipant.mutedUntil,
            isMarkedUnread: currentParticipant.isMarkedUnread,
            lastReadAt: currentParticipant.lastReadAt,
          }
        : null,
      participants: chat.participants.map((participant) => {
        const user = usersMap.get(participant.userId);

        return {
          userId: participant.userId,
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
    };
  }

  private async restoreChat(
    currentUserId: string,
    chatId: string,
  ): Promise<void> {
    await this.prisma.chatParticipant.update({
      where: {
        chatId_userId: {
          chatId,
          userId: currentUserId,
        },
      },
      data: {
        deletedAt: null,
      },
    });
  }
}

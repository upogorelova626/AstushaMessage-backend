import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { UsersService } from '../../users/users/users.service.js';

@Injectable()
export class ArchivedChatsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async getArchivedChats(currentUserId: string, cookie?: string) {
    const chats = await this.prisma.chat.findMany({
      where: {
        participants: {
          some: {
            userId: currentUserId,
            isArchived: true,
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

        messages: {
          where: {
            deletedAt: null,
          },
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          take: 1,
        },

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

      const { messages, ...chatData } = chat;

      return {
        ...chatData,

        lastMessage: messages[0] ?? null,

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
}

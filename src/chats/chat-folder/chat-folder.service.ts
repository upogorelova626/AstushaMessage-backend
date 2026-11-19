import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class ChatFolderService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllFolders(userId: string) {
    return this.prisma.chatFolder.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async getFolderWithChats(userId: string, folderId: string) {
    const folder = await this.prisma.chatFolder.findFirst({
      where: {
        id: folderId,
        userId,
      },
      include: {
        items: {
          where: {
            chat: {
              participants: {
                some: {
                  userId,
                  deletedAt: null,
                },
              },
            },
          },
          include: {
            chat: {
              select: {
                id: true,
                type: true,
                title: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
      },
    });

    if (!folder) {
      throw new NotFoundException('Папка не найдена');
    }

    return folder;
  }

  async createNewFolder(userId: string, name: string, chatIds: string[]) {
    const folderName = name.trim();

    if (!folderName) {
      throw new BadRequestException('Название папки не может быть пустым');
    }

    if (!chatIds.length) {
      throw new BadRequestException('Выберите хотя бы один чат');
    }

    const existingFolder = await this.prisma.chatFolder.findFirst({
      where: {
        userId,
        name: folderName,
      },
    });

    if (existingFolder) {
      throw new ConflictException('Папка с таким названием уже существует');
    }

    const chatsCount = await this.prisma.chatParticipant.count({
      where: {
        userId,
        chatId: {
          in: chatIds,
        },
        deletedAt: null,
      },
    });

    if (chatsCount !== new Set(chatIds).size) {
      throw new NotFoundException('Один или несколько чатов не найдены');
    }

    return this.prisma.chatFolder.create({
      data: {
        userId,
        name: folderName,
        items: {
          create: [...new Set(chatIds)].map((chatId) => ({
            chat: {
              connect: {
                id: chatId,
              },
            },
          })),
        },
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        items: {
          select: {
            chatId: true,
          },
        },
      },
    });
  }

  async renameFolder(userId: string, folderId: string, name: string) {
    const folder = await this.prisma.chatFolder.findFirst({
      where: {
        id: folderId,
        userId,
      },
    });

    if (!folder) {
      throw new NotFoundException('Папка не найдена');
    }

    const existingFolder = await this.prisma.chatFolder.findFirst({
      where: {
        userId,
        name,
        id: {
          not: folderId,
        },
      },
    });

    if (existingFolder) {
      throw new ConflictException('Папка с таким названием уже существует');
    }

    return this.prisma.chatFolder.update({
      where: {
        id: folderId,
        userId,
      },
      data: {
        name,
      },
    });
  }

  async deleteFolder(userId: string, folderId: string) {
    const result = await this.prisma.chatFolder.deleteMany({
      where: {
        id: folderId,
        userId,
      },
    });

    if (result.count === 0) {
      throw new NotFoundException('Папка не найдена');
    }
  }

  async addChatToFolder(userId: string, folderId: string, chatId: string) {
    const folder = await this.prisma.chatFolder.findFirst({
      where: {
        id: folderId,
        userId,
      },
    });

    if (!folder) {
      throw new NotFoundException('Папка не найдена');
    }

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

    const existingItem = await this.prisma.chatFolderItem.findUnique({
      where: {
        folderId_chatId: {
          folderId,
          chatId,
        },
      },
    });

    if (existingItem) {
      throw new ConflictException('Чат уже находится в этой папке');
    }

    return this.prisma.chatFolderItem.create({
      data: {
        folderId,
        chatId,
      },
    });
  }

  async deleteChatFromFolder(userId: string, folderId: string, chatId: string) {
    const result = await this.prisma.chatFolderItem.deleteMany({
      where: {
        folderId,
        chatId,
        folder: {
          userId,
        },
      },
    });

    if (result.count === 0) {
      throw new NotFoundException('Чат не найден в папке');
    }
  }
}

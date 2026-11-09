import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service.js';
import type { Message } from '../../generated/prisma/client.js';
import type { CreateMessageDto } from '../dto/create-message.dto.js';
import type { EditMessageDto } from '../dto/edit-message.dto.js';
import type { GetMessagesResponse } from '../dto/messages.dto.js';
import { MessagesGateway } from '../messages.gateway.js';

@Injectable()
export class MessageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly messagesGateway: MessagesGateway,
  ) {}

  async sendMessage(
    userId: string,
    chatId: string,
    dto: CreateMessageDto,
  ): Promise<Message> {
    await this.getChatParticipant(userId, chatId);

    const text = dto.text.trim();

    if (!text) {
      throw new BadRequestException('Сообщение не может быть пустым');
    }

    const [message] = await this.prisma.$transaction([
      this.prisma.message.create({
        data: {
          chatId,
          senderId: userId,
          text,
        },
      }),
      this.prisma.chat.update({
        where: { id: chatId },
        data: { updatedAt: new Date() },
      }),
    ]);

    this.messagesGateway.emitNewMessage(message);

    return message;
  }

  async getMessages(
    userId: string,
    chatId: string,
    cursor?: string | null,
  ): Promise<GetMessagesResponse> {
    const participant = await this.getChatParticipant(userId, chatId);

    const where = {
      chatId,
      deletedAt: null,
      ...(participant.clearedAt && {
        createdAt: {
          gt: participant.clearedAt,
        },
      }),
    };

    if (cursor) {
      const cursorMessage = await this.prisma.message.findFirst({
        where: {
          ...where,
          id: cursor,
        },
        select: {
          id: true,
        },
      });

      if (!cursorMessage) {
        throw new BadRequestException('Некорректный курсор');
      }
    }

    const messages = await this.prisma.message.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: 21,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const hasMore = messages.length > 20;
    const items = messages.slice(0, 20).reverse();
    const nextCursor = hasMore ? items[0].id : null;

    return {
      items,
      hasMore,
      nextCursor,
    };
  }

  async getMessage(
    userId: string,
    chatId: string,
    messageId: string,
  ): Promise<Message> {
    const participant = await this.getChatParticipant(userId, chatId);

    const message = await this.prisma.message.findFirst({
      where: {
        id: messageId,
        chatId,
        deletedAt: null,
        ...(participant.clearedAt && {
          createdAt: {
            gt: participant.clearedAt,
          },
        }),
      },
    });

    if (!message) {
      throw new NotFoundException('Сообщение не найдено');
    }

    return message;
  }

  async editMessage(
    userId: string,
    chatId: string,
    messageId: string,
    dto: EditMessageDto,
  ): Promise<Message> {
    const participant = await this.getChatParticipant(userId, chatId);

    const text = dto.text.trim();

    if (!text) {
      throw new BadRequestException('Сообщение не может быть пустым');
    }

    const message = await this.prisma.message.findFirst({
      where: {
        id: messageId,
        chatId,
        deletedAt: null,
        ...(participant.clearedAt && {
          createdAt: {
            gt: participant.clearedAt,
          },
        }),
      },
    });

    if (!message) {
      throw new NotFoundException('Сообщение не найдено');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException(
        'Вы не можете редактировать чужое сообщение',
      );
    }

    return this.prisma.message.update({
      where: {
        id: messageId,
      },
      data: {
        editedAt: new Date(),
        text,
      },
    });
  }

  async searchMessage(
    userId: string,
    chatId: string,
    query: string,
    cursor?: string | null,
  ): Promise<GetMessagesResponse> {
    const participant = await this.getChatParticipant(userId, chatId);

    const text = query.trim();

    if (!text) {
      throw new BadRequestException('Поисковый запрос не может быть пустым');
    }

    const where = {
      chatId,
      deletedAt: null,
      ...(participant.clearedAt && {
        createdAt: {
          gt: participant.clearedAt,
        },
      }),
      text: {
        contains: text,
        mode: 'insensitive' as const,
      },
    };

    if (cursor) {
      const cursorMessage = await this.prisma.message.findFirst({
        where: {
          ...where,
          id: cursor,
        },
        select: {
          id: true,
        },
      });

      if (!cursorMessage) {
        throw new BadRequestException('Некорректный курсор');
      }
    }

    const messages = await this.prisma.message.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: 21,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const hasMore = messages.length > 20;
    const items = messages.slice(0, 20);
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return {
      items,
      hasMore,
      nextCursor,
    };
  }

  async deleteMessage(
    userId: string,
    chatId: string,
    messageId: string,
  ): Promise<void> {
    const participant = await this.getChatParticipant(userId, chatId);

    const message = await this.prisma.message.findFirst({
      where: {
        id: messageId,
        chatId,
        deletedAt: null,
        ...(participant.clearedAt && {
          createdAt: {
            gt: participant.clearedAt,
          },
        }),
      },
    });

    if (!message) {
      throw new NotFoundException('Сообщение не найдено');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('Вы не можете удалить чужое сообщение');
    }

    await this.prisma.message.update({
      where: {
        id: messageId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
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

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateMessageDto } from '../dto/create-message.dto.js';
import { Message } from '../../generated/prisma/client.js';
import { EditMessageDto } from '../dto/edit-message.dto.js';
import { GetMessagesResponse } from '../dto/messages.dto.js';
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
    const participant = await this.prisma.chatParticipant.findUnique({
      where: {
        chatId_userId: {
          chatId,
          userId,
        },
      },
    });

    if (!participant) {
      throw new NotFoundException('Чат не найден');
    }

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
    cursor?: null | string,
  ): Promise<GetMessagesResponse> {
    const participant = await this.prisma.chatParticipant.findUnique({
      where: { chatId_userId: { chatId, userId } },
    });

    if (!participant) {
      throw new NotFoundException('Чат не найден');
    }

    const messages = await this.prisma.message.findMany({
      where: {
        chatId,
        deletedAt: null,
      },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      take: 16,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const hasMore = messages.length > 15;
    const items = messages.slice(0, 15);
    const nextCursor = hasMore ? items[items.length - 1].id : null;

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
    const participant = await this.prisma.chatParticipant.findUnique({
      where: {
        chatId_userId: {
          chatId,
          userId,
        },
      },
    });

    if (!participant) {
      throw new NotFoundException('Чат не найден');
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

    return message;
  }

  async editMessage(
    userId: string,
    chatId: string,
    messageId: string,
    dto: EditMessageDto,
  ): Promise<Message> {
    const participant = await this.prisma.chatParticipant.findUnique({
      where: {
        chatId_userId: {
          chatId,
          userId,
        },
      },
    });

    if (!participant) {
      throw new NotFoundException('Сообщение не найдено');
    }

    const text = dto.text.trim();

    if (!text) {
      throw new BadRequestException('Сообщение не может быть пустым');
    }

    const message = await this.prisma.message.findFirst({
      where: {
        id: messageId,
        chatId,
        deletedAt: null,
      },
    });

    if (!message) {
      throw new NotFoundException('Чат не найден');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException(
        'Вы не можете редактировать чужое сообщение',
      );
    }

    const newMessage = await this.prisma.message.update({
      where: {
        id: messageId,
      },
      data: {
        editedAt: new Date(),
        text,
      },
    });

    return newMessage;
  }

  async deleteMessage(
    userId: string,
    chatId: string,
    messageId: string,
  ): Promise<void> {
    const participant = await this.prisma.chatParticipant.findUnique({
      where: {
        chatId_userId: {
          chatId,
          userId,
        },
      },
    });

    if (!participant) {
      throw new NotFoundException('Чат не найден');
    }

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
}

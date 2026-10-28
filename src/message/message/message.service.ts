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

@Injectable()
export class MessageService {
  constructor(private readonly prisma: PrismaService) {}

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

    return message;
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

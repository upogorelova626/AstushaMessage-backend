import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WsException,
} from '@nestjs/websockets';
import { parseCookie } from 'cookie';
import type { Server, Socket } from 'socket.io';

import type { AccessTokenPayload } from '../auth/types/access-token-payload.type.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { isUUID } from 'class-validator';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:4205',
    credentials: true,
  },
})
export class MessagesGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(MessagesGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  afterInit(server: Server): void {
    server.use(async (client: Socket, next) => {
      try {
        const cookies = parseCookie(client.handshake.headers.cookie ?? '');

        const accessToken = cookies.accessToken;

        if (!accessToken) {
          return next(new Error('Unauthorized'));
        }

        const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(
          accessToken,
          {
            secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
          },
        );

        if (typeof payload.sub !== 'string' || !payload.sub) {
          return next(new Error('Unauthorized'));
        }

        client.data.userId = payload.sub;

        next();
      } catch {
        next(new Error('Unauthorized'));
      }
    });
  }

  handleConnection(client: Socket): void {
    this.logger.log(`Подключился пользователь: ${client.data.userId}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Отключился пользователь: ${client.data.userId}`);
  }

  @SubscribeMessage('chat:join')
  async joinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody('chatId') chatId: string,
  ): Promise<void> {
    if (!isUUID(chatId)) {
      throw new WsException('Некорректный ID чата');
    }

    const userId = client.data.userId;

    const participant = await this.prisma.chatParticipant.findUnique({
      where: {
        chatId_userId: {
          chatId,
          userId,
        },
      },
    });

    if (!participant || participant.deletedAt) {
      throw new WsException('Чат не найден');
    }

    await client.join(`chat:${chatId}`);

    this.logger.log(
      `Пользователь ${userId} подключился к комнате chat:${chatId}`,
    );
  }

  @SubscribeMessage('chat:leave')
  async leaveChat(
    @ConnectedSocket() client: Socket,
    @MessageBody('chatId') chatId: string,
  ): Promise<void> {
    if (!isUUID(chatId)) {
      throw new WsException('Некорректный ID чата');
    }

    await client.leave(`chat:${chatId}`);

    this.logger.log(`Socket ${client.id} покинул комнату chat:${chatId}`);
  }
}

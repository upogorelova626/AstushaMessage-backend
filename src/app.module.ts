import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ChatsModule } from './chats/chats/chats.module.js';
import { ChatSettingsModule } from './chats/chat-settings/chat-settings.module.js';
import { ChatManagenentModule } from './chats/chat-managenent/chat-managenent.module.js';
import { MessageModule } from './message/message/message.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    ChatsModule,
    ChatSettingsModule,
    ChatManagenentModule,
    MessageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

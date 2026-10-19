import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { ChatsService } from './chats.service.js';
import { CreateChatDto } from '../dto/create-chat.dto.js';
import type { AuthenticatedRequest } from '../../auth/types/authenticated-request.type.js';

@Controller('chats')
@ApiTags('Chats')
@ApiCookieAuth('accessToken')
@UseGuards(JwtAuthGuard)
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post()
  @ApiOperation({ summary: 'Создать новый чат' })
  @ApiCreatedResponse({
    description: 'Чат успешно создан',
  })
  create(@Req() request: AuthenticatedRequest, @Body() dto: CreateChatDto) {
    return this.chatsService.createNewChat(request.user.id, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Получить список чатов',
    description:
      'Возвращает все чаты текущего пользователя с данными участников',
  })
  @ApiOkResponse({
    description: 'Список чатов успешно получен',
  })
  getAll(@Req() request: AuthenticatedRequest) {
    return this.chatsService.getAllChats(
      request.user.id,
      request.headers.cookie,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Получить чат по идентификатору',
    description: 'Возвращет чат, если текущий пользователь имеет к нему доступ',
  })
  @ApiOkResponse({
    description: 'Чат успешно получен',
  })
  @ApiNotFoundResponse({
    description: 'Чат не найден или у пользователя нет доступа',
  })
  getById(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.chatsService.getChatById(
      request.user.id,
      id,
      request.headers.cookie,
    );
  }
}

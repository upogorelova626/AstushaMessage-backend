import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { CreateMessageDto } from '../dto/create-message.dto.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { MessageService } from './message.service.js';
import type { AuthenticatedRequest } from '../../auth/types/authenticated-request.type.js';
import { EditMessageDto } from '../dto/edit-message.dto.js';
import { GetMessagesDto } from '../dto/get-messages.dto.js';
import { SearchMessagesDto } from '../dto/search-message.dto.js';

@ApiTags('Messages')
@ApiCookieAuth('accessToken')
@ApiParam({
  name: 'chatId',
  description: 'UUID чата',
  type: String,
  format: 'uuid',
})
@ApiUnauthorizedResponse({
  description: 'Пользователь не авторизован',
})
@ApiBadRequestResponse({
  description: 'Некорректные параметры запроса',
})
@ApiNotFoundResponse({
  description: 'Чат или сообщение не найдено',
})
@UseGuards(JwtAuthGuard)
@Controller('chats/:chatId/messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  @ApiOperation({
    summary: 'Отправить новое сообщение',
  })
  @ApiCreatedResponse({
    description: 'Сообщение успешно отправлено',
  })
  create(
    @Req() request: AuthenticatedRequest,
    @Param('chatId', ParseUUIDPipe) chatId: string,
    @Body() dto: CreateMessageDto,
  ) {
    return this.messageService.sendMessage(request.user.id, chatId, dto);
  }

  @Post('list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Получить сообщения',
  })
  @ApiOkResponse({
    description: 'Сообщения успешно получены',
  })
  getMessages(
    @Req() request: AuthenticatedRequest,
    @Param('chatId', ParseUUIDPipe) chatId: string,
    @Body() dto: GetMessagesDto,
  ) {
    return this.messageService.getMessages(request.user.id, chatId, dto.cursor);
  }

  @Get(':messageId')
  @ApiOperation({ summary: 'Получить сообщение по ID' })
  @ApiOkResponse({ description: 'Сообщение успешно получено' })
  @ApiParam({
    name: 'messageId',
    description: 'UUID сообщения',
    type: String,
    format: 'uuid',
  })
  getMessage(
    @Req() request: AuthenticatedRequest,
    @Param('chatId', ParseUUIDPipe) chatId: string,
    @Param('messageId', ParseUUIDPipe) messageId: string,
  ) {
    return this.messageService.getMessage(request.user.id, chatId, messageId);
  }

  @Patch(':messageId')
  @ApiOperation({ summary: 'Редактировать сообщение' })
  @ApiOkResponse({ description: 'Сообщение успешно отредактировано' })
  @ApiForbiddenResponse({
    description: 'Пользователь не может редактировать чужое сообщение',
  })
  @ApiParam({
    name: 'messageId',
    description: 'UUID сообщения',
    type: String,
    format: 'uuid',
  })
  editMessage(
    @Req() request: AuthenticatedRequest,
    @Param('chatId', ParseUUIDPipe) chatId: string,
    @Param('messageId', ParseUUIDPipe) messageId: string,
    @Body() dto: EditMessageDto,
  ) {
    return this.messageService.editMessage(
      request.user.id,
      chatId,
      messageId,
      dto,
    );
  }

  @Post('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Поиск сообщений в чате',
  })
  @ApiOkResponse({
    description: 'Сообщения успешно найдены',
  })
  searchMessages(
    @Req() request: AuthenticatedRequest,
    @Param('chatId', ParseUUIDPipe) chatId: string,
    @Body() dto: SearchMessagesDto,
  ) {
    return this.messageService.searchMessage(
      request.user.id,
      chatId,
      dto.query,
    );
  }

  @Delete(':messageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Удалить сообщение',
  })
  @ApiParam({
    name: 'messageId',
    description: 'UUID сообщения',
    type: String,
    format: 'uuid',
  })
  @ApiNoContentResponse({
    description: 'Сообщение успешно удалено',
  })
  @ApiForbiddenResponse({
    description: 'Пользователь не может удалить чужое сообщение',
  })
  deleteMessage(
    @Req() request: AuthenticatedRequest,
    @Param('chatId', ParseUUIDPipe) chatId: string,
    @Param('messageId', ParseUUIDPipe) messageId: string,
  ) {
    return this.messageService.deleteMessage(
      request.user.id,
      chatId,
      messageId,
    );
  }
}

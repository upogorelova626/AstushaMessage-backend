import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import type { AuthenticatedRequest } from '../../auth/types/authenticated-request.type.js';
import { ChatFolderService } from './chat-folder.service.js';
import { CreateChatFolderDto } from '../dto/create-folder.dto.js';
import { UpdateChatFolderDto } from '../dto/rename-folder.dto.js';
import { AddChatToFolderDto } from '../dto/add-chat-to-folder.dto.js';

@Controller('chat-folders')
@ApiTags('Chat folders')
@ApiCookieAuth('accessToken')
@UseGuards(JwtAuthGuard)
export class ChatFolderController {
  constructor(private readonly chatFolderService: ChatFolderService) {}

  @Get()
  @ApiOperation({
    summary: 'Получить список папок',
    description: 'Возвращает все пользовательские папки текущего пользователя',
  })
  @ApiOkResponse({
    description: 'Список папок успешно получен',
  })
  getAll(@Req() request: AuthenticatedRequest) {
    return this.chatFolderService.getAllFolders(request.user.id);
  }

  @Get(':folderId')
  @ApiOperation({
    summary: 'Получить папку с чатами',
    description: 'Возвращает папку и связанные с ней чаты',
  })
  @ApiOkResponse({
    description: 'Папка успешно получена',
  })
  @ApiNotFoundResponse({
    description: 'Папка не найдена или у пользователя нет доступа',
  })
  getById(
    @Req() request: AuthenticatedRequest,
    @Param('folderId', ParseUUIDPipe) folderId: string,
  ) {
    return this.chatFolderService.getFolderWithChats(request.user.id, folderId);
  }

  @Post()
  @ApiOperation({
    summary: 'Создать новую папку',
  })
  @ApiCreatedResponse({
    description: 'Папка успешно создана',
  })
  @ApiConflictResponse({
    description: 'Папка с таким названием уже существует',
  })
  @ApiBadRequestResponse({
    description: 'Некорректные данные папки',
  })
  create(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateChatFolderDto,
  ) {
    return this.chatFolderService.createNewFolder(
      request.user.id,
      dto.name,
      dto.chatIds,
    );
  }

  @Patch(':folderId')
  @ApiOperation({
    summary: 'Переименовать папку',
  })
  @ApiOkResponse({
    description: 'Папка успешно переименована',
  })
  @ApiNotFoundResponse({
    description: 'Папка не найдена или у пользователя нет доступа',
  })
  @ApiConflictResponse({
    description: 'Папка с таким названием уже существует',
  })
  rename(
    @Req() request: AuthenticatedRequest,
    @Param('folderId', ParseUUIDPipe) folderId: string,
    @Body() dto: UpdateChatFolderDto,
  ) {
    return this.chatFolderService.renameFolder(
      request.user.id,
      folderId,
      dto.name,
    );
  }

  @Delete(':folderId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Удалить папку',
    description: 'Удаляет папку, не удаляя сами чаты',
  })
  @ApiNoContentResponse({
    description: 'Папка успешно удалена',
  })
  @ApiNotFoundResponse({
    description: 'Папка не найдена или у пользователя нет доступа',
  })
  delete(
    @Req() request: AuthenticatedRequest,
    @Param('folderId', ParseUUIDPipe) folderId: string,
  ) {
    return this.chatFolderService.deleteFolder(request.user.id, folderId);
  }

  @Post(':folderId/chats')
  @ApiOperation({
    summary: 'Добавить чат в папку',
  })
  @ApiCreatedResponse({
    description: 'Чат успешно добавлен в папку',
  })
  @ApiNotFoundResponse({
    description: 'Папка или чат не найдены либо нет доступа',
  })
  @ApiConflictResponse({
    description: 'Чат уже находится в этой папке',
  })
  addChat(
    @Req() request: AuthenticatedRequest,
    @Param('folderId', ParseUUIDPipe) folderId: string,
    @Body() dto: AddChatToFolderDto,
  ) {
    return this.chatFolderService.addChatToFolder(
      request.user.id,
      folderId,
      dto.chatId,
    );
  }

  @Delete(':folderId/chats/:chatId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Удалить чат из папки',
    description: 'Удаляет связь с папкой, сам чат не удаляется',
  })
  @ApiNoContentResponse({
    description: 'Чат успешно удалён из папки',
  })
  @ApiNotFoundResponse({
    description: 'Чат не найден в папке или у пользователя нет доступа',
  })
  deleteChat(
    @Req() request: AuthenticatedRequest,
    @Param('folderId', ParseUUIDPipe) folderId: string,
    @Param('chatId', ParseUUIDPipe) chatId: string,
  ) {
    return this.chatFolderService.deleteChatFromFolder(
      request.user.id,
      folderId,
      chatId,
    );
  }
}

import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { ArchivedChatsService } from './archived-chats.service.js';
import type { AuthenticatedRequest } from '../../auth/types/authenticated-request.type.js';

@ApiTags('archived-chats')
@ApiCookieAuth('accessToken')
@UseGuards(JwtAuthGuard)
@Controller('archived-chats')
export class ArchivedChatsController {
  constructor(private readonly archivedChatsService: ArchivedChatsService) {}

  @Get()
  @ApiOperation({
    summary: 'Получить список архивированных чатов',
    description:
      'Возвращает все арихивированные чаты текущего пользователя с данными участников',
  })
  @ApiOkResponse({
    description: 'Список чатов успешно получен',
  })
  getAll(@Req() request: AuthenticatedRequest) {
    return this.archivedChatsService.getArchivedChats(
      request.user.id,
      request.headers.cookie,
    );
  }
}

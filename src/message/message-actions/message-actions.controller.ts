import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import type { AuthenticatedRequest } from '../../auth/types/authenticated-request.type.js';
import { PinMessageDto } from '../dto/pin-message.dto.js';
import { MessageActionsService } from './message-actions.service.js';

@ApiTags('Message Actions')
@ApiCookieAuth('accessToken')
@ApiParam({
  name: 'chatId',
  description: 'UUID чата',
  type: String,
  format: 'uuid',
})
@ApiParam({
  name: 'messageId',
  description: 'UUID сообщения',
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
export class MessageActionsController {
  constructor(private readonly messageActionsService: MessageActionsService) {}

  @Patch(':messageId/pin')
  @ApiOperation({
    summary: 'Закрепить сообщение',
  })
  @ApiOkResponse({
    description: 'Сообщение успешно закреплено',
  })
  pinMessage(
    @Req() request: AuthenticatedRequest,
    @Param('chatId', ParseUUIDPipe) chatId: string,
    @Param('messageId', ParseUUIDPipe) messageId: string,
    @Body() dto: PinMessageDto,
  ) {
    return this.messageActionsService.pinMessage(
      request.user.id,
      chatId,
      messageId,
      dto.duration,
    );
  }

  @Delete(':messageId/pin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Открепить сообщение',
  })
  @ApiOkResponse({
    description: 'Сообщение успешно откреплено',
  })
  unpinMessage(
    @Req() request: AuthenticatedRequest,
    @Param('chatId', ParseUUIDPipe) chatId: string,
    @Param('messageId', ParseUUIDPipe) messageId: string,
  ) {
    return this.messageActionsService.unpinMessage(
      request.user.id,
      chatId,
      messageId,
    );
  }
}

import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class PinChatDto {
  @ApiProperty({
    description: 'Прикреплен ли чат',
    example: true,
  })
  @IsBoolean()
  isPinned!: boolean;
}

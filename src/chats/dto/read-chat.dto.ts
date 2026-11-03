import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class ReadChatDto {
  @ApiProperty({
    description: 'Прочитан ли чат',
    example: true,
  })
  @IsBoolean()
  isMarkedUnread!: boolean;
}

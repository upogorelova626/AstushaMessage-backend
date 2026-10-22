import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class ArchiveChatDto {
  @ApiProperty({
    description: 'Архивирован ли чат',
    example: true,
  })
  @IsBoolean()
  isArchived!: boolean;
}

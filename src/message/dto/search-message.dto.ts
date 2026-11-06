import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SearchMessagesDto {
  @ApiProperty({
    description: 'Текст для поиска сообщений',
    example: 'привет',
  })
  @IsString()
  @IsNotEmpty()
  query!: string;
}

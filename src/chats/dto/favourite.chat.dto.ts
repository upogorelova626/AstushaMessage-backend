import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class FavoriteChatDto {
  @ApiProperty({
    description: 'Находится ли чат в избранном',
    example: true,
  })
  @IsBoolean()
  isFavorite!: boolean;
}

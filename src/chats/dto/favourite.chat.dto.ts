import { IsBoolean } from 'class-validator';

export class FavoriteChatDto {
  @IsBoolean()
  isFavorite!: boolean;
}

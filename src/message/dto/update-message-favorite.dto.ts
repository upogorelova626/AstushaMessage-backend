import { IsBoolean } from 'class-validator';

export class UpdateMessageFavoriteDto {
  @IsBoolean()
  isFavorite: boolean;
}

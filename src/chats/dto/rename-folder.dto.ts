import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateChatFolderDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;
}

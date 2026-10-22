import { IsBoolean } from 'class-validator';

export class ArchiveChatDto {
  @IsBoolean()
  isArchived!: boolean;
}

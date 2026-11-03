import { IsOptional, IsUUID } from 'class-validator';

export class GetMessagesDto {
  @IsOptional()
  @IsUUID()
  cursor?: string | null;
}

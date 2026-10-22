import { IsBoolean, IsEnum, IsOptional } from 'class-validator';

export enum MuteDuration {
  EIGHT_HOURS = 'EIGHT_HOURS',
  ONE_WEEK = 'ONE_WEEK',
  FOREVER = 'FOREVER',
}

export class MuteChatDto {
  @IsBoolean()
  isMuted!: boolean;

  @IsOptional()
  @IsEnum(MuteDuration)
  duration?: MuteDuration;
}

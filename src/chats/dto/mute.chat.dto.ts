import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';

export enum MuteDuration {
  EIGHT_HOURS = 'EIGHT_HOURS',
  ONE_WEEK = 'ONE_WEEK',
  FOREVER = 'FOREVER',
}

export class MuteChatDto {
  @ApiProperty({
    description: 'Отключены ли уведомления',
    example: true,
  })
  @IsBoolean()
  isMuted!: boolean;

  @ApiPropertyOptional({
    description: 'Продолжительность отключения уведомлений',
    enum: MuteDuration,
    example: MuteDuration.EIGHT_HOURS,
  })
  @IsOptional()
  @IsEnum(MuteDuration)
  duration?: MuteDuration;
}

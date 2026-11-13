import { IsEnum } from 'class-validator';

export enum PinMessageDuration {
  OneDay = '1d',
  SevenDays = '7d',
  ThirtyDays = '30d',
}

export class PinMessageDto {
  @IsEnum(PinMessageDuration)
  duration: PinMessageDuration;
}

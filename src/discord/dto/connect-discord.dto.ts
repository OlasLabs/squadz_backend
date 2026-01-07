import { IsString, IsNotEmpty } from 'class-validator';

export class ConnectDiscordDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  state: string;
}


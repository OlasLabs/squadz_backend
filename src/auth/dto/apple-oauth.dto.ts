import { IsString, IsNotEmpty } from 'class-validator';

export class AppleOAuthDto {
  @IsString()
  @IsNotEmpty()
  idToken: string;
}


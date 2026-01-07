import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  identifier: string; // Email OR SQUADZ ID

  @IsString()
  @IsNotEmpty()
  password: string;
}

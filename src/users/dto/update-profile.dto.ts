import { IsString, IsOptional, IsEnum } from 'class-validator';
import { Position } from '@prisma/client';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  knownAsName?: string;

  @IsString()
  @IsOptional()
  nationality?: string;

  @IsString()
  @IsOptional()
  currentLocation?: string;

  @IsString()
  @IsOptional()
  favoriteTeam?: string;

  @IsString()
  @IsOptional()
  psnId?: string;

  @IsEnum(Position)
  @IsOptional()
  primaryPosition?: Position;

  @IsEnum(Position)
  @IsOptional()
  secondaryPosition?: Position;
}


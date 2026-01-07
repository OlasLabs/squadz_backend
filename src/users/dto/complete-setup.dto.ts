import {
  IsInt,
  Min,
  Max,
  IsString,
  IsOptional,
  IsEnum,
  ValidateIf,
  IsNotEmpty,
} from 'class-validator';
import { Position } from '@prisma/client';

export class CompleteSetupDto {
  @IsInt()
  @Min(1)
  @Max(4)
  page: number;

  // Page 1 fields
  @ValidateIf((o) => o.page === 1)
  @IsString()
  @IsNotEmpty()
  nationality?: string;

  @ValidateIf((o) => o.page === 1)
  @IsString()
  @IsNotEmpty()
  currentLocation?: string;

  @ValidateIf((o) => o.page === 1)
  @IsString()
  @IsOptional()
  favoriteTeam?: string;

  @ValidateIf((o) => o.page === 1)
  @IsString()
  @IsOptional()
  psnId?: string;

  @ValidateIf((o) => o.page === 1)
  @IsString()
  @IsOptional()
  knownAsName?: string;

  // Page 2 fields
  @ValidateIf((o) => o.page === 2)
  @IsString()
  @IsNotEmpty()
  authorizationCode?: string;

  // Page 3 fields
  @ValidateIf((o) => o.page === 3)
  @IsEnum(Position)
  primaryPosition?: Position;

  @ValidateIf((o) => o.page === 3)
  @IsOptional()
  @IsEnum(Position)
  secondaryPosition?: Position;

  // Page 4: avatar file handled separately in multipart
}


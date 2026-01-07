import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SetupCompleteGuard } from '../common/guards/setup-complete.guard';
import { OwnResourceGuard } from '../common/guards/own-resource.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CompleteSetupDto } from './dto/complete-setup.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /users/:id
   * View user profile
   * Permission: Any PLAYER can view any profile
   */
  @Get(':id')
  @UseGuards(SetupCompleteGuard)
  async getUserProfile(@Param('id') userId: string) {
    return this.usersService.getUserById(userId);
  }

  /**
   * POST /users/:id/setup
   * Complete account setup (progressive 4-page system)
   * Permission: OWN resource only (USER role)
   * 
   * Supports pages 1-3 with JSON body and page 4 with multipart/form-data
   * Pages can be completed in any order
   * 
   * Page 1 (JSON): { page: 1, nationality, currentLocation, favouriteTeam?, psnId?, knownAsName? }
   * Page 2 (JSON): { page: 2, authorizationCode }
   * Page 3 (JSON): { page: 3, primaryPosition, secondaryPosition? }
   * Page 4 (Multipart): Form data with 'page' field = 4 and 'avatar' file
   */
  @Post(':id/setup')
  @UseGuards(OwnResourceGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  async completeSetup(
    @Param('id') userId: string,
    @Body() dto: CompleteSetupDto,
    @UploadedFile() file?: any,
  ) {
    // Validate page 4 has file
    if (dto.page === 4 && !file) {
      throw new BadRequestException('Avatar file is required for page 4');
    }

    // Validate pages 1-3 don't have file
    if (dto.page !== 4 && file) {
      throw new BadRequestException('File upload only allowed for page 4');
    }

    return this.usersService.completeSetup(userId, dto, file);
  }

  /**
   * PATCH /users/:id/profile
   * Update own profile
   * Permission: OWN resource only
   */
  @Patch(':id/profile')
  @UseGuards(OwnResourceGuard)
  async updateProfile(
    @Param('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, dto);
  }

  /**
   * POST /users/:id/avatar
   * Update profile picture
   * Permission: OWN resource only
   */
  @Post(':id/avatar')
  @UseGuards(OwnResourceGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  async updateAvatar(
    @Param('id') userId: string,
    @UploadedFile() file: any,
  ) {
    return this.usersService.updateAvatar(userId, file);
  }

  /**
   * PATCH /users/:id/password
   * Change own password
   * Permission: OWN resource only
   */
  @Patch(':id/password')
  @UseGuards(OwnResourceGuard)
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Param('id') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(userId, dto);
  }

  /**
   * DELETE /users/:id/setup/page2
   * Disconnect Discord
   * Permission: OWN resource only
   */
  @Delete(':id/setup/page2')
  @UseGuards(OwnResourceGuard)
  @HttpCode(HttpStatus.OK)
  async disconnectDiscord(@Param('id') userId: string) {
    return this.usersService.disconnectDiscord(userId);
  }
}


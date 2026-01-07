import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DiscordService } from './discord.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OwnResourceGuard } from '../common/guards/own-resource.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ConnectDiscordDto } from './dto/connect-discord.dto';

@Controller('discord')
export class DiscordController {
  constructor(private readonly discordService: DiscordService) {}

  /**
   * POST /discord/connect
   * Initiate Discord OAuth connection
   * Permission: USER (during setup) or PLAYER+ (reconnect)
   */
  @Post('connect')
  async initiateConnection(@CurrentUser() user: any) {
    return this.discordService.getOAuthUrl(user.sub);
  }

  /**
   * POST /discord/callback
   * Handle Discord OAuth callback
   * Permission: PUBLIC (OAuth callback)
   */
  @Post('callback')
  @HttpCode(HttpStatus.OK)
  async handleCallback(@Body() dto: ConnectDiscordDto) {
    return this.discordService.handleOAuthCallback(dto.code, dto.state);
  }

  /**
   * DELETE /discord/disconnect
   * Disconnect Discord account
   * Permission: OWN resource
   */
  @Delete('disconnect')
  @HttpCode(HttpStatus.OK)
  async disconnect(@CurrentUser() user: any) {
    return this.discordService.disconnectAccount(user.sub);
  }

  /**
   * GET /discord/status
   * Check Discord connection status
   * Permission: OWN resource
   */
  @Get('status')
  async getStatus(@CurrentUser() user: any) {
    return this.discordService.getConnectionStatus(user.sub);
  }

  /**
   * POST /discord/channels/squad/:squadId
   * Create squad team channel
   * Permission: SQUAD (Captain only)
   */
  @Post('channels/squad/:squadId')
  async createSquadChannel(
    @Param('squadId') squadId: string,
    @CurrentUser() user: any,
  ) {
    return this.discordService.createSquadChannel(squadId, user.sub);
  }

  /**
   * PATCH /discord/channels/squad/:squadId/members
   * Add/remove members from squad channel
   * Permission: SQUAD (Captain only)
   */
  @Patch('channels/squad/:squadId/members')
  async updateSquadChannelMembers(
    @Param('squadId') squadId: string,
    @Body() dto: { action: 'add' | 'remove'; userId: string },
    @CurrentUser() user: any,
  ) {
    return this.discordService.updateChannelMembers(
      squadId,
      dto.action,
      dto.userId,
      user.sub,
    );
  }

  /**
   * GET /discord/channels/squad/:squadId/link
   * Get squad channel deep link
   * Permission: SQUAD members only
   */
  @Get('channels/squad/:squadId/link')
  async getSquadChannelLink(
    @Param('squadId') squadId: string,
    @CurrentUser() user: any,
  ) {
    return this.discordService.getSquadChannelLink(squadId, user.sub);
  }

  /**
   * POST /discord/channels/match/:matchId
   * Create match coordination channel (system/admin only)
   * Permission: ADMIN
   */
  @Post('channels/match/:matchId')
  async createMatchChannel(
    @Param('matchId') matchId: string,
    @CurrentUser() user: any,
  ) {
    return this.discordService.createMatchChannel(matchId, user.sub);
  }

  /**
   * GET /discord/channels/match/:matchId/link
   * Get match channel deep link
   * Permission: Captain/Vice Captain of participating squads
   */
  @Get('channels/match/:matchId/link')
  async getMatchChannelLink(
    @Param('matchId') matchId: string,
    @CurrentUser() user: any,
  ) {
    return this.discordService.getMatchChannelLink(matchId, user.sub);
  }

  /**
   * POST /discord/channels/transfer/:requestId
   * Create transfer negotiation channel
   * Permission: Captain initiating transfer
   */
  @Post('channels/transfer/:requestId')
  async createTransferChannel(
    @Param('requestId') requestId: string,
    @CurrentUser() user: any,
  ) {
    return this.discordService.createTransferChannel(requestId, user.sub);
  }

  /**
   * GET /discord/channels/transfer/:requestId/link
   * Get transfer channel deep link
   * Permission: Captain (sender) and Player (recipient)
   */
  @Get('channels/transfer/:requestId/link')
  async getTransferChannelLink(
    @Param('requestId') requestId: string,
    @CurrentUser() user: any,
  ) {
    return this.discordService.getTransferChannelLink(requestId, user.sub);
  }
}


import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly frontendUrl: string;

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
    this.frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ||
      'http://localhost:3000';
  }

  /**
   * Send email verification OTP to user
   * @param email User's email address
   * @param otp 6-digit verification code
   * @param squadzId User's SQUADZ ID
   */
  async sendVerificationEmail(
    email: string,
    otp: string,
    squadzId: string,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Verify Your SQUADZ Account',
        template: 'email-verification',
        context: {
          otp,
          squadzId,
          expiryMinutes: 3,
        },
      });

      this.logger.log(`Verification email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send verification email to ${email}: ${error.message}`,
      );
      throw new Error('Failed to send verification email');
    }
  }

  /**
   * Send password reset OTP to user
   * @param email User's email address
   * @param otp 6-digit reset code
   */
  async sendPasswordResetEmail(email: string, otp: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Reset Your SQUADZ Password',
        template: 'password-reset',
        context: {
          otp,
          expiryMinutes: 5,
          supportEmail: 'support@squadz.app',
        },
      });

      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${email}: ${error.message}`,
      );
      throw new Error('Failed to send password reset email');
    }
  }

  /**
   * Send account lockout notification
   * @param email User's email address
   * @param unlockTime When the account will be unlocked
   */
  async sendAccountLockoutEmail(
    email: string,
    unlockTime: Date,
  ): Promise<void> {
    try {
      const lockoutMinutes = 15;
      const formattedUnlockTime = unlockTime.toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        timeZoneName: 'short',
      });

      await this.mailerService.sendMail({
        to: email,
        subject: 'SQUADZ Account Temporarily Locked',
        template: 'account-lockout',
        context: {
          unlockTime: formattedUnlockTime,
          lockoutMinutes,
          supportEmail: 'support@squadz.app',
        },
      });

      this.logger.log(`Account lockout email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send lockout email to ${email}: ${error.message}`,
      );
      throw new Error('Failed to send lockout email');
    }
  }
}


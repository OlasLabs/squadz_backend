import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

@Injectable()
export class TokenGeneratorService {
  /**
   * Generate secure reset token (32 random bytes as hex)
   */
  generateResetToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Get reset token expiry time (1 hour from now)
   */
  getResetTokenExpiry(): Date {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1);
    return expiry;
  }

  /**
   * Check if reset token is expired
   */
  isResetTokenExpired(expiryTime: Date): boolean {
    return new Date() > expiryTime;
  }
}

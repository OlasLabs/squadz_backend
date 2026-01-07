import { Injectable } from '@nestjs/common';

@Injectable()
export class OtpGeneratorService {
  /**
   * Generate 6-digit numeric OTP
   */
  generate(): string {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    return otp;
  }

  /**
   * Get OTP expiry time (3 minutes from now)
   */
  getExpiryTime(): Date {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 3);
    return expiry;
  }

  /**
   * Check if OTP is expired
   */
  isExpired(expiryTime: Date): boolean {
    return new Date() > expiryTime;
  }
}

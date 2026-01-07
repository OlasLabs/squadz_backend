import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SquadzIdGeneratorService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate unique SQUADZ ID with format: SQZ-XXXXXXXX
   * 8 random alphanumeric characters (uppercase)
   */
  async generate(): Promise<string> {
    let squadzId = '';
    let isUnique = false;

    while (!isUnique) {
      // Generate 8 random uppercase alphanumeric characters
      const randomChars = this.generateRandomString(8);
      squadzId = `SQZ-${randomChars}`;

      // Check uniqueness in database
      const existing = await this.prisma.user.findUnique({
        where: { squadzId },
      });

      if (!existing) {
        isUnique = true;
      }
    }

    return squadzId;
  }

  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      result += chars[randomIndex];
    }

    return result;
  }
}

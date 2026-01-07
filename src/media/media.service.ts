import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sharp from 'sharp';
import * as AWS from 'aws-sdk';
import axios from 'axios';
import FormData from 'form-data';

interface ProcessImageOutput {
  avatarUrl: string;
  thumbnailUrl: string;
}

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  private readonly s3: AWS.S3;
  private readonly bucketName: string;
  private readonly removalAiApiKey: string;

  constructor(private configService: ConfigService) {
    this.bucketName =
      this.configService.get<string>('AWS_S3_BUCKET') || 'squadz-media-dev';
    this.removalAiApiKey =
      this.configService.get<string>('REMOVAL_AI_API_KEY') || '';

    this.s3 = new AWS.S3({
      accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get<string>('AWS_REGION') || 'us-east-1',
    });
  }

  async processAvatar(file: any, userId: string): Promise<ProcessImageOutput> {
    try {
      // 1. Validation
      this.validateFile(file);

      // 2. Background Removal (with fallback)
      let processedBuffer: Buffer;
      try {
        processedBuffer = await this.removeBackground(file.buffer);
      } catch (error) {
        this.logger.warn(
          `Background removal failed for user ${userId}, using original image: ${error.message}`,
        );
        processedBuffer = file.buffer;
      }

      // 3. Main Image Optimization (512x512, WebP quality 85%)
      const mainImage = await sharp(processedBuffer)
        .resize(512, 512, { fit: 'cover' })
        .webp({ quality: 85 })
        .toBuffer();

      // 4. Thumbnail Generation (128x128, WebP quality 80%)
      const thumbnail = await sharp(processedBuffer)
        .resize(128, 128, { fit: 'cover' })
        .webp({ quality: 80 })
        .toBuffer();

      // 5. Upload to S3
      const mainImageKey = `avatars/${userId}.webp`;
      const thumbnailKey = `avatars/${userId}_thumb.webp`;

      await this.uploadToS3(mainImage, mainImageKey, 'image/webp');
      await this.uploadToS3(thumbnail, thumbnailKey, 'image/webp');

      // 6. Return URLs
      const avatarUrl = this.getS3Url(mainImageKey);
      const thumbnailUrl = this.getS3Url(thumbnailKey);

      return { avatarUrl, thumbnailUrl };
    } catch (error) {
      this.logger.error(
        `Avatar processing failed for user ${userId}: ${error.message}`,
      );
      throw new InternalServerErrorException('Failed to process avatar');
    }
  }

  private validateFile(file: any): void {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, and WebP are allowed.',
      );
    }

    if (file.size > maxSize) {
      throw new BadRequestException(
        'File size exceeds 5MB limit. Please upload a smaller image.',
      );
    }
  }

  private async removeBackground(buffer: Buffer): Promise<Buffer> {
    if (!this.removalAiApiKey) {
      this.logger.warn('Removal.ai API key not configured, skipping');
      return buffer;
    }

    try {
      const formData = new FormData();
      formData.append('image_file', buffer, {
        filename: 'image.png',
        contentType: 'image/png',
      });

      const response = await axios.post(
        'https://api.removal.ai/3.0/remove',
        formData,
        {
          headers: {
            'Rm-Token': this.removalAiApiKey,
            ...formData.getHeaders(),
          },
          responseType: 'arraybuffer',
          timeout: 30000, // 30 seconds
        },
      );

      return Buffer.from(response.data);
    } catch (error) {
      throw new Error(`Background removal failed: ${error.message}`);
    }
  }

  private async uploadToS3(
    buffer: Buffer,
    key: string,
    contentType: string,
  ): Promise<void> {
    try {
      await this.s3
        .putObject({
          Bucket: this.bucketName,
          Key: key,
          Body: buffer,
          ContentType: contentType,
          ACL: 'public-read',
        })
        .promise();
    } catch (error) {
      this.logger.error(`S3 upload failed for key ${key}: ${error.message}`);
      throw new InternalServerErrorException('Failed to upload image to S3');
    }
  }

  private getS3Url(key: string): string {
    return `https://${this.bucketName}.s3.amazonaws.com/${key}`;
  }
}

import { Injectable, Logger } from '@nestjs/common';
import * as Minio from 'minio';

@Injectable()
export class MinioService {
  private readonly logger = new Logger(MinioService.name);
  private readonly minioClient: Minio.Client;
  private readonly bucketName = 'user-profiles';

  constructor() {
    this.minioClient = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT || '9000'),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || 'admin',
      secretKey: process.env.MINIO_SECRET_KEY || 'password',
    });

    this.ensureBucketExists();
  }

  private async ensureBucketExists() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        this.logger.log(`Bucket ${this.bucketName} created successfully`);
      }
    } catch (error) {
      this.logger.error(`Error ensuring bucket exists: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    userId: string,
  ): Promise<string> {
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExtension}`;

    const metadata = {
      'Content-Type': file.mimetype,
    };

    try {
      await this.minioClient.putObject(
        this.bucketName,
        fileName,
        file.buffer,
        file.size,
        metadata,
      );

      this.logger.log(`File uploaded successfully: ${fileName}`);
      return fileName;
    } catch (error) {
      this.logger.error(`Error uploading file: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async deleteFile(fileName: string): Promise<void> {
    try {
      await this.minioClient.removeObject(this.bucketName, fileName);
      this.logger.log(`File deleted successfully: ${fileName}`);
    } catch (error) {
      this.logger.error(`Error deleting file: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  getFileUrl(fileName: string): Promise<string> {
    return this.minioClient.presignedGetObject(
      this.bucketName,
      fileName,
      24 * 60 * 60, // URL valid for 24 hours
    );
  }

  async getFile(fileName: string): Promise<Buffer> {
    try {
      const chunks: Buffer[] = [];
      const stream = await this.minioClient.getObject(
        this.bucketName,
        fileName,
      );

      return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
      });
    } catch (error) {
      this.logger.error(`Error getting file: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
}

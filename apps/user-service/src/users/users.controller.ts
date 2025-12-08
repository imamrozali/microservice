import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { MinioService } from '../minio/minio.service';
import type { CreateUserDto, UpdateUserDto, VerifyUserDto } from '../dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly minioService: MinioService,
  ) {}

  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    
    // Add photoUrl for each user that has profile_picture
    const usersWithPhotos = await Promise.all(
      users.map(async (user) => {
        if (user.profile_picture) {
          try {
            const photoUrl = await this.minioService.getFileUrl(user.profile_picture);
            return { ...user, photoUrl };
          } catch (error) {
            console.error(`Failed to get photo URL for user ${user.id}:`, error);
            return user;
          }
        }
        return user;
      })
    );
    
    return usersWithPhotos;
  }

  @Get(':id/validate')
  async validateUser(@Param('id') id: string) {
    // This endpoint returns user even if deleted for auth validation
    return await this.usersService.findByIdIncludingDeleted(id);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    
    // Add photoUrl if user has profile_picture
    if (user?.profile_picture) {
      try {
        const photoUrl = await this.minioService.getFileUrl(user.profile_picture);
        return { ...user, photoUrl };
      } catch (error) {
        console.error(`Failed to get photo URL for user ${id}:`, error);
      }
    }
    
    return user;
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verify(@Body() data: VerifyUserDto) {
    const user = await this.usersService.verifyCredentials(data.email, data.password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    return user;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() data: CreateUserDto) {
    return await this.usersService.create(data);
  }

  @Put('password')
  async updatePassword(
    @Req() req: Request,
    @Body() data: { currentPassword: string; newPassword: string }
  ) {
    const userId = this.extractUserIdFromToken(req);
    
    try {
      await this.usersService.updatePassword(userId, data.currentPassword, data.newPassword);
      return { message: 'Password updated successfully' };
    } catch (error: any) {
      throw new BadRequestException(error?.message || 'Failed to update password');
    }
  }

  @Put('profile')
  async updateProfile(@Req() req: Request, @Body() data: UpdateUserDto) {
    const userId = this.extractUserIdFromToken(req);
    return await this.usersService.update(userId, data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: UpdateUserDto) {
    return await this.usersService.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.usersService.delete(id);
  }

  @Post(':id/upload-photo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPhoto(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only JPEG and PNG images are allowed');
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size must not exceed 2MB');
    }

    // Get current user to delete old photo if exists
    const user = await this.usersService.findById(id);
    if (user?.profile_picture) {
      try {
        await this.minioService.deleteFile(user.profile_picture);
      } catch (error) {
        // Log error but continue with upload
        console.error('Error deleting old photo:', error);
      }
    }

    // Upload new photo
    const fileName = await this.minioService.uploadFile(file, id);
    
    // Update user with new photo filename (this will not trigger profile_update notification)
    await this.usersService.updatePhotoOnly(id, fileName);

    // Get presigned URL for immediate access
    const photoUrl = await this.minioService.getFileUrl(fileName);

    return {
      message: 'Photo uploaded successfully',
      fileName,
      photoUrl,
    };
  }

  @Get(':id/photo')
  async getPhoto(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    
    if (!user?.profile_picture) {
      throw new BadRequestException('User has no profile picture');
    }

    const photoUrl = await this.minioService.getFileUrl(user.profile_picture);
    
    return {
      photoUrl,
      fileName: user.profile_picture,
    };
  }

  private extractUserIdFromToken(req: Request): string {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split(' ')[1];
    try {
      // Decode JWT without verification (since this is user-service, not auth-service)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(Buffer.from(base64, 'base64').toString());
      
      if (!payload.sub) {
        throw new UnauthorizedException('Invalid token payload');
      }
      
      return payload.sub;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}

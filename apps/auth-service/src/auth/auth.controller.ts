import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Request,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginDto, LogoutDto, RefreshTokenDto, TokenResponseDto } from './auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'User login',
    description: 'Authenticate user dengan email dan password. Response berisi access_token dan refresh_token.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyM2U3N2U4ZC1kZDQ1LTQ2NGUtOGE2NC0wNTkyMTA5MjI5MzgiLCJlbWFpbCI6ImVtcGxveWVlQGRleGEuY29tIiwicm9sZV9pZCI6IjM0MzFhNzUyLWI0NTktNDc4ZC1hNTIyLTlkNTc3Y2RhMWJmYSIsImlhdCI6MTc2NTE1ODg5OSwiZXhwIjoxNzY1MTU5Nzk5fQ.PDmPg8GO08zjV0_inBNSMNpWMPJ8uZBH6AU_FVpqHSE',
        refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyM2U3N2U4ZC1kZDQ1LTQ2NGUtOGE2NC0wNTkyMTA5MjI5MzgiLCJlbWFpbCI6ImVtcGxveWVlQGRleGEuY29tIiwicm9sZV9pZCI6IjM0MzFhNzUyLWI0NTktNDc4ZC1hNTIyLTlkNTc3Y2RhMWJmYSIsImlhdCI6MTc2NTE1ODg5OSwiZXhwIjoxNzY1NzYzNjk5fQ.Dejy_zcJxx93y5o5eoE7jijjCUcbQwk6pD3giUleclM',
        expires_in: 900,
        user: {
          id: '23e77e8d-dd45-464e-8a64-059210922938',
          email: 'employee@dexa.com',
          full_name: 'John Doe',
          role_id: '3431a752-b459-478d-a522-9d577cda1bfa'
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto): Promise<TokenResponseDto> {
    return await this.authService.login(loginDto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'User logout',
    description: '⚠️ Requires Authorization header with access_token. Body berisi refresh_token untuk dihapus dari database.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Logout successful',
    schema: {
      example: {
        message: 'Logged out successfully'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(
    @Request() req: any,
    @Body() logoutDto: LogoutDto,
  ): Promise<{ message: string }> {
    await this.authService.logout(req.user.id, logoutDto.refresh_token);
    return { message: 'Logged out successfully' };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Refresh access token',
    description: 'Gunakan refresh_token untuk mendapatkan access_token baru ketika expired (setelah 15 menit).'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Token refreshed successfully',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new_token...',
        refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new_refresh_token...',
        expires_in: 900
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<TokenResponseDto> {
    return await this.authService.refreshToken(refreshTokenDto.refresh_token);
  }

  @Get('verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Verify JWT token',
    description: '⚠️ Requires Authorization header. Verifikasi apakah access_token masih valid.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Token is valid',
    schema: {
      example: {
        valid: true,
        user: {
          id: '23e77e8d-dd45-464e-8a64-059210922938',
          email: 'employee@dexa.com',
          full_name: 'John Doe',
          job_position: 'Software Engineer',
          role_id: '3431a752-b459-478d-a522-9d577cda1bfa',
          is_active: true
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Invalid token' })
  async verify(@Request() req: any) {
    return {
      valid: true,
      user: req.user,
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get current user profile',
    description: '⚠️ Requires Authorization header. Mendapatkan data user yang sedang login.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User profile retrieved',
    schema: {
      example: {
        id: '23e77e8d-dd45-464e-8a64-059210922938',
        email: 'employee@dexa.com',
        full_name: 'John Doe',
        job_position: 'Software Engineer',
        phone_number: null,
        photo_url: 'https://example.com/photos/employee.png',
        role_id: '3431a752-b459-478d-a522-9d577cda1bfa',
        is_active: true,
        created_at: '2025-12-08T01:04:47.010Z',
        updated_at: '2025-12-08T01:04:47.010Z'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Request() req: any) {
    return req.user;
  }
}

import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ 
    example: 'employee@dexa.com', 
    description: 'User email address',
    required: true 
  })
  email: string;

  @ApiProperty({ 
    example: 'employee123', 
    description: 'User password',
    required: true 
  })
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({ 
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyM2U3N2U4ZC1kZDQ1LTQ2NGUtOGE2NC0wNTkyMTA5MjI5MzgiLCJlbWFpbCI6ImVtcGxveWVlQGRleGEuY29tIiwicm9sZV9pZCI6IjM0MzFhNzUyLWI0NTktNDc4ZC1hNTIyLTlkNTc3Y2RhMWJmYSIsImlhdCI6MTc2NTE1ODg5OSwiZXhwIjoxNzY1NzYzNjk5fQ.Dejy_zcJxx93y5o5eoE7jijjCUcbQwk6pD3giUleclM',
    description: 'Refresh token dari response login',
    required: true
  })
  refresh_token: string;
}

export class LogoutDto {
  @ApiProperty({ 
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyM2U3N2U4ZC1kZDQ1LTQ2NGUtOGE2NC0wNTkyMTA5MjI5MzgiLCJlbWFpbCI6ImVtcGxveWVlQGRleGEuY29tIiwicm9sZV9pZCI6IjM0MzFhNzUyLWI0NTktNDc4ZC1hNTIyLTlkNTc3Y2RhMWJmYSIsImlhdCI6MTc2NTE1ODg5OSwiZXhwIjoxNzY1NzYzNjk5fQ.Dejy_zcJxx93y5o5eoE7jijjCUcbQwk6pD3giUleclM',
    description: 'Refresh token untuk dihapus dari database',
    required: true
  })
  refresh_token: string;
}

export class TokenResponseDto {
  @ApiProperty({ description: 'JWT access token' })
  access_token: string;

  @ApiProperty({ description: 'Refresh token', required: false })
  refresh_token?: string;

  @ApiProperty({ description: 'Token expiration time in seconds', example: 900 })
  expires_in: number;

  @ApiProperty({ description: 'User information', required: false })
  user?: {
    id: string;
    email: string;
    full_name: string;
    role_id: string;
    role_name: string;
    photo_url?: string | null;
  };
}

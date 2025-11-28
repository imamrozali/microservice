import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  MinLength,
} from "class-validator";

export class RegisterDto {
  @ApiProperty({
    description: "User email address",
    example: "newuser@company.com",
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: "User password (minimum 6 characters)",
    example: "password123",
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: "User role code",
    example: "EMPLOYEE",
    required: false,
    default: "EMPLOYEE",
  })
  @IsString()
  @IsOptional()
  roleCode?: string = "EMPLOYEE";
}

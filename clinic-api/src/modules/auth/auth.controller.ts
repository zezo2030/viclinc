import { Body, Controller, Post } from '@nestjs/common';
import { IsEmail, IsString, MinLength, Matches } from 'class-validator';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { AuthService } from './auth.service';

class RegisterPatientDto {
  @ApiProperty({ description: 'Patient full name', example: 'Ahmed Mohamed' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Patient email address', example: 'ahmed@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Patient phone number', example: '+1234567890' })
  @IsString()
  @Matches(/^\+?[0-9]{6,15}$/)
  phone: string;

  @ApiProperty({ description: 'Patient password', example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;
}

class LoginDto {
  @ApiProperty({ description: 'User email address', example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User password', example: 'password123' })
  @IsString()
  password: string;
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register/patient')
  @ApiOperation({ summary: 'Register a new patient' })
  @ApiResponse({ status: 201, description: 'Patient registered successfully' })
  registerPatient(@Body() dto: RegisterPatientDto) {
    return this.auth.registerPatient(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }
}



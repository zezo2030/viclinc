import { Body, Controller, Post, Get, UseGuards, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IsEmail, IsString, MinLength, Matches } from 'class-validator';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty, ApiBody, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { avatarUploadConfig } from './config/avatar-upload.config';

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
  @ApiProperty({ 
    description: 'User email address (works for Admin, Doctor, and Patient)', 
    example: 'admin@clinic.com',
    examples: {
      admin: {
        value: 'admin@clinic.com',
        summary: 'Admin login example'
      },
      doctor: {
        value: 'ahmed@clinic.com',
        summary: 'Doctor login example'
      },
      patient: {
        value: 'sara@example.com',
        summary: 'Patient login example'
      }
    }
  })
  @IsEmail()
  email: string;

  @ApiProperty({ 
    description: 'User password', 
    example: 'password123',
    minLength: 6
  })
  @IsString()
  password: string;
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register/patient')
  @ApiOperation({ 
    summary: 'Register a new patient',
    description: 'Supports both JSON and multipart/form-data. If using multipart/form-data, you can upload an avatar image.'
  })
  @ApiConsumes('application/json', 'multipart/form-data')
  @UseInterceptors(FileInterceptor('avatar', avatarUploadConfig))
  @ApiResponse({ status: 201, description: 'Patient registered successfully' })
  registerPatient(
    @Body() dto: RegisterPatientDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    // إذا تم رفع ملف، أضف مساره إلى DTO
    if (file) {
      const avatarPath = `/static/uploads/avatars/${file.filename}`;
      return this.auth.registerPatient({ ...dto, avatar: avatarPath });
    }
    return this.auth.registerPatient(dto);
  }

  @Post('login')
  @ApiOperation({ 
    summary: 'User login (Admin, Doctor, Patient)',
    description: 'Login endpoint works for all user roles. Returns JWT token and user information. For admin login, use email: admin@clinic.com and password: password123'
  })
  @ApiBody({
    description: 'Login credentials',
    schema: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: {
          type: 'string',
          format: 'email',
          example: 'admin@clinic.com',
          description: 'User email address (works for Admin, Doctor, and Patient)',
          examples: {
            admin: {
              value: 'admin@clinic.com',
              summary: 'Admin login - use this email for admin access'
            },
            doctor: {
              value: 'ahmed@clinic.com',
              summary: 'Doctor login example'
            },
            patient: {
              value: 'sara@example.com',
              summary: 'Patient login example'
            }
          }
        },
        password: {
          type: 'string',
          example: 'password123',
          minLength: 6,
          description: 'User password'
        }
      },
      example: {
        email: 'admin@clinic.com',
        password: 'password123'
      },
      examples: {
        admin: {
          summary: 'Admin Login',
          description: 'Use these credentials to login as admin',
          value: {
            email: 'admin@clinic.com',
            password: 'password123'
          }
        },
        doctor: {
          summary: 'Doctor Login',
          value: {
            email: 'ahmed@clinic.com',
            password: 'password123'
          }
        },
        patient: {
          summary: 'Patient Login',
          value: {
            email: 'sara@example.com',
            password: 'password123'
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          description: 'JWT access token - use this in Authorization header as Bearer token'
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '64f1a2b3c4d5e6f7g8h9i0j1' },
            email: { type: 'string', example: 'admin@clinic.com' },
            name: { type: 'string', example: 'مدير النظام' },
            phone: { type: 'string', example: '+966501234567' },
            role: { 
              type: 'string', 
              enum: ['ADMIN', 'DOCTOR', 'PATIENT'],
              example: 'ADMIN',
              description: 'User role - ADMIN, DOCTOR, or PATIENT'
            }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Invalid credentials - email or password is incorrect'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Doctor account not approved yet (for DOCTOR role only)'
  })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get current user profile',
    description: 'Returns the authenticated user\'s profile information based on the JWT token'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User profile retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '64f1a2b3c4d5e6f7g8h9i0j1' },
        email: { type: 'string', example: 'admin@clinic.com' },
        name: { type: 'string', example: 'مدير النظام' },
        phone: { type: 'string', example: '+966501234567' },
        role: { 
          type: 'string', 
          enum: ['ADMIN', 'DOCTOR', 'PATIENT'],
          example: 'ADMIN',
          description: 'User role - ADMIN, DOCTOR, or PATIENT'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - invalid or missing token'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found'
  })
  async getMe(@Req() req: any) {
    return this.auth.getUserById(req.user.sub);
  }
}



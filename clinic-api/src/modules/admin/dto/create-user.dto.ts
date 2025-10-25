import { IsEmail, IsString, MinLength, Matches, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../users/schemas/user.schema';

export class CreateUserDto {
  @ApiProperty({ description: 'User full name', example: 'Ahmed Mohamed' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'User email address', example: 'ahmed@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User phone number', example: '+1234567890' })
  @IsString()
  @Matches(/^\+?[0-9]{6,15}$/)
  phone: string;

  @ApiProperty({ description: 'User password', example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'User role', enum: Role, example: Role.PATIENT })
  @IsEnum(Role)
  role: Role;
}

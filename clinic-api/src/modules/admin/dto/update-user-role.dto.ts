import { IsEnum, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../users/schemas/user.schema';

export class UpdateUserRoleDto {
  @ApiProperty({ description: 'New user role', enum: Role, example: Role.DOCTOR })
  @IsEnum(Role)
  role: Role;

  @ApiProperty({ description: 'Reason for role change', example: 'User requested doctor role', required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}

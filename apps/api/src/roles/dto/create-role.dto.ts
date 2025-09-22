import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsInt } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  permissionIds?: string[];

  @ApiProperty()
  @IsOptional()
  metadata?: Record<string, any>;
}

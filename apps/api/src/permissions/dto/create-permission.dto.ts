import { IsString, IsOptional, IsJSON, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  action: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty()
  @IsJSON()
  @IsOptional()
  conditions?: Record<string, any>;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsJSON()
  @IsOptional()
  metadata?: Record<string, any>;
}

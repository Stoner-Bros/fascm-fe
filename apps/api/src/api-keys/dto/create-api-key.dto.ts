import { IsString, IsOptional, IsInt, IsObject, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateApiKeyDto {
  @ApiProperty()
  @IsString()
  name: string;

  // @ApiProperty()
  // @IsEnum(ApiKeyPermission, { each: true })
  // @IsOptional()
  // permissions?: ApiKeyPermission[];

  @ApiProperty()
  @IsInt()
  @IsOptional()
  @Min(1)
  expiresInDays?: number;

  @ApiProperty()
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiProperty()
  @IsObject()
  @IsOptional()
  rateLimit?: {
    requests: number;
    perSeconds: number;
  };
}

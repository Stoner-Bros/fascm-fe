import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    description: 'The first name of the user',
    example: 'John',
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({
    description: 'The last name of the user',
    example: 'Doe',
  })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'Password123!',
  })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({
    description: 'The avatar of the user',
    example: 'https://example.com/avatar.png',
  })
  @IsString()
  @IsOptional()
  avatar?: string;
}

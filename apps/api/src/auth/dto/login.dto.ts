import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'The email address of the user',
    format: 'email',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'The password for the account',
    minimum: 8,
    format: 'password',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;
}

import { ApiProperty } from '@nestjs/swagger';

export class AuthUserDto {
  constructor(user: any) {
    this.id = user.id;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.email = user.email;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'The unique identifier of the user',
  })
  id: string;

  @ApiProperty({
    example: 'John',
    description: 'The first name of the user',
  })
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'The last name of the user',
  })
  lastName: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'The email address of the user',
  })
  email: string;

  @ApiProperty({
    example: '2024-01-04T12:00:00Z',
    description: 'The timestamp when the user was created',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-04T12:00:00Z',
    description: 'The timestamp when the user was last updated',
  })
  updatedAt: Date;
}

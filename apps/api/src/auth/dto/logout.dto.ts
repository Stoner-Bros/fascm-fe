import { ApiProperty } from '@nestjs/swagger';

export class LogoutDto {
  @ApiProperty({
    example: 'userId',
    description: 'The id of the user',
  })
  userId: string;
}

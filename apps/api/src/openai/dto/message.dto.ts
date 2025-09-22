import { ApiProperty } from '@nestjs/swagger';

export class MessageDto {
  @ApiProperty({
    description: 'Message content',
    example: 'Hello, how can you help me today?',
  })
  content: any;
}

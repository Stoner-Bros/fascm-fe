import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    description: 'The content of the comment',
    example: 'This was a really helpful blog post!',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}

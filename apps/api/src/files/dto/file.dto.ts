import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FileDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'The file to upload',
    required: true,
  })
  file: any;
}

export class FilesDto {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    description: 'Files to upload',
    required: true,
  })
  files: any[];
}

export class FileResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  filename: string;

  @ApiProperty()
  mimetype: string;

  @ApiProperty()
  size: number;

  @ApiProperty()
  path: string;

  @ApiProperty({ required: false })
  url?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class FindFilesQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  filename?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  mimetype?: string;
}

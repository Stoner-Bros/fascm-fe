import { IsOptional, IsString } from 'class-validator';

export class CreateThreadDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

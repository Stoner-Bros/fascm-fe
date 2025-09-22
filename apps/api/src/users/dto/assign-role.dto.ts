import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class AssignRoleDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  userId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  roleId: string;
}

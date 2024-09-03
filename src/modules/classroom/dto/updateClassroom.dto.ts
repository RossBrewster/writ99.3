import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UpdateClassroomDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  teacherId?: number;
}
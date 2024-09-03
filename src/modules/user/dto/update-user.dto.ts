import { IsEmail, IsOptional, IsString, MinLength, IsEnum } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsEnum(['student', 'teacher', 'admin'])
  role?: 'student' | 'teacher' | 'admin';
}
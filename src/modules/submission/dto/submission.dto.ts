import { IsNotEmpty, IsNumber, IsString, IsDate, IsOptional } from 'class-validator';

export class CreateSubmissionDto {
    @IsNotEmpty()
    @IsNumber()
    assignmentId: number;
  
    @IsNotEmpty()
    @IsNumber()
    studentId: number;
  
    @IsNotEmpty()
    @IsNumber()
    draftNumber: number;
  
    @IsNotEmpty()
    @IsString()
    content: string;
}

export class UpdateSubmissionDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsNumber()
  draftNumber?: number;

  @IsOptional()
  @IsDate()
  submissionDate?: Date;
}

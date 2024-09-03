import { IsNotEmpty, IsNumber, IsString, IsDate, IsOptional, IsISO8601 } from 'class-validator';
import { Type } from 'class-transformer';


export class CreateRubricTemplateDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsISO8601()
    createdDate: string;

    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    createdById: number;
    }

export class UpdateRubricTemplateDto {
  @IsOptional()
  @IsString()
  name?: string;
}

export class CreateRubricCriteriaDto {
    @IsNotEmpty()
    @IsString()
    name: string;
  
    @IsNotEmpty()
    @IsString()
    description: string;
  
    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    maxScore: number;
  
    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    templateId: number;
}
  

export class UpdateRubricCriteriaDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    maxScore?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    templateId?: number;
}
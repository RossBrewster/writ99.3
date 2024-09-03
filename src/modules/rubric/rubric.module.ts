import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RubricController } from './rubric.controller';
import { RubricService } from './rubric.service';
import { RubricTemplate } from '../../database/entities/RubricTemplate.entity';
import { RubricCriteria } from '../../database/entities/RubricCriteria.entity';
import { RubricTemplateRepository } from '../../database/repositories/RubricTemplate.repository';
import { RubricCriteriaRepository } from '../../database/repositories/RubricCriteria.repository';

@Module({
  imports: [TypeOrmModule.forFeature([RubricTemplate, RubricCriteria])],
  controllers: [RubricController],
  providers: [RubricService, RubricTemplateRepository, RubricCriteriaRepository],
  exports: [RubricService],
})
export class RubricModule {}
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedbackRepository } from '../../database/repositories/Feedback.repository';
import { StudentSubmissionRepository } from '../../database/repositories/StudentSubmission.repository';
import { RubricCriteriaRepository } from '../../database/repositories/RubricCriteria.repository';
import { RubricVersionRepository } from '../../database/repositories/RubricVersion.repository';
import { AssignmentRepository } from '../../database/repositories/Assignment.repository';
import { AIGradingService } from './grading.service';
import { GradingController } from './grading.controller';
import { StudentSubmission } from '../../database/entities/StudentSubmission.entity';
import { Feedback } from '../../database/entities/Feedback.entity';
import { RubricCriteria } from '../../database/entities/RubricCriteria.entity';
import { RubricVersion } from '../../database/entities/RubricVersion.entity';
import { Assignment } from '../../database/entities/Assignment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StudentSubmission,
      Feedback,
      RubricCriteria,
      RubricVersion,
      Assignment
    ]),
  ],
  providers: [
    AIGradingService,
    FeedbackRepository,
    StudentSubmissionRepository,
    RubricCriteriaRepository,
    RubricVersionRepository,
    AssignmentRepository,
  ],
  controllers: [GradingController],
  exports: [AIGradingService],
})
export class GradingModule {}

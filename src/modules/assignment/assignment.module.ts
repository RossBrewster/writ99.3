import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assignment } from '../../database/entities/Assignment.entity';
import { Classroom } from '../../database/entities/Classroom.entity';
import { User } from '../../database/entities/User.entity';
import { ClassroomAssignment } from '../../database/entities/ClassroomAssignment.entity';
import { AssignmentRepository } from '../../database/repositories/Assignment.repository';
import { ClassroomRepository } from '../../database/repositories/Classroom.repository';
import { UserRepository } from '../../database/repositories/User.repository';
import { ClassroomAssignmentRepository } from '../../database/repositories/ClassroomAssignment.repository';
import { AssignmentService } from './assignment.service';
import { AssignmentController } from './assignment.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Assignment, Classroom, User, ClassroomAssignment]),
  ],
  providers: [
    AssignmentRepository,
    ClassroomRepository,
    UserRepository,
    ClassroomAssignmentRepository,
    AssignmentService,
  ],
  controllers: [AssignmentController],
  exports: [AssignmentService, AssignmentRepository],
})
export class AssignmentModule {}
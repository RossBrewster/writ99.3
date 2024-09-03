import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentSubmissionRepository } from '../../database/repositories/StudentSubmission.repository';
import { CreateSubmissionDto, UpdateSubmissionDto } from './dto/submission.dto';
import { Assignment } from '../../database/entities/Assignment.entity';
import { User } from '../../database/entities/User.entity';
import { StudentSubmission } from '../../database/entities/StudentSubmission.entity';

@Injectable()
export class SubmissionService {
  constructor(
    private studentSubmissionRepository: StudentSubmissionRepository,
    @InjectRepository(Assignment)
    private assignmentRepository: Repository<Assignment>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async create(createSubmissionDto: CreateSubmissionDto) {
    const assignment = await this.assignmentRepository.findOne({ where: { id: createSubmissionDto.assignmentId } });
    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${createSubmissionDto.assignmentId} not found`);
    }

    const student = await this.userRepository.findOne({ where: { id: createSubmissionDto.studentId } });
    if (!student) {
      throw new NotFoundException(`User with ID ${createSubmissionDto.studentId} not found`);
    }

    const newSubmission = new StudentSubmission();
    newSubmission.assignment = assignment;
    newSubmission.student = student;
    newSubmission.draftNumber = createSubmissionDto.draftNumber;
    newSubmission.content = createSubmissionDto.content;

    return await this.studentSubmissionRepository.create(newSubmission);
  }


  async findOne(id: number) {
    const submission = await this.studentSubmissionRepository.findById(id);
    if (!submission) {
      throw new NotFoundException(`Submission with ID ${id} not found`);
    }
    return submission;
  }

  async update(id: number, updateSubmissionDto: UpdateSubmissionDto) {
    const submission = await this.studentSubmissionRepository.findById(id);
    if (!submission) {
      throw new NotFoundException(`Submission with ID ${id} not found`);
    }
    return await this.studentSubmissionRepository.update(id, updateSubmissionDto);
  }

  async findByAssignment(assignmentId: number) {
    return await this.studentSubmissionRepository.findByAssignmentId(assignmentId);
  }

  async getSubmissionsByStudent(studentId: number) {
    return await this.studentSubmissionRepository.findByStudentId(studentId);
  }
}
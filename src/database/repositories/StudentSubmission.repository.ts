import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentSubmission } from '../entities/StudentSubmission.entity';

@Injectable()
export class StudentSubmissionRepository {
  constructor(
    @InjectRepository(StudentSubmission)
    private studentSubmissionRepository: Repository<StudentSubmission>,
  ) {}

  async create(submissionData: Partial<StudentSubmission>): Promise<StudentSubmission> {
    const submission = this.studentSubmissionRepository.create(submissionData);
    return await this.studentSubmissionRepository.save(submission);
  }

  async findAll(): Promise<StudentSubmission[]> {
    return await this.studentSubmissionRepository.find();
  }

  async findById(id: number, relations: string[] = []): Promise<StudentSubmission | undefined> {
    return await this.studentSubmissionRepository.findOne({ where: { id }, relations });
  }

  async update(id: number, submissionData: Partial<StudentSubmission>): Promise<StudentSubmission | undefined> {
    await this.studentSubmissionRepository.update(id, submissionData);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.studentSubmissionRepository.delete(id);
  }

  async findByAssignmentId(assignmentId: number): Promise<StudentSubmission[]> {
    return await this.studentSubmissionRepository.find({
      where: { assignment: { id: assignmentId } },
      relations: ['assignment', 'student', 'feedback'],
    });
  }

  async findByStudentId(studentId: number): Promise<StudentSubmission[]> {
    return await this.studentSubmissionRepository.find({
      where: { student: { id: studentId } },
      relations: ['assignment', 'student', 'feedback'],
    });
  }

  async findLatestDraft(assignmentId: number, studentId: number): Promise<StudentSubmission | undefined> {
    return await this.studentSubmissionRepository.findOne({
      where: { assignment: { id: assignmentId }, student: { id: studentId } },
      order: { draftNumber: 'DESC' },
      relations: ['assignment', 'student', 'feedback'],
    });
  }
}
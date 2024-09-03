import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassroomAssignment } from '../entities/ClassroomAssignment.entity';

@Injectable()
export class ClassroomAssignmentRepository {
  constructor(
    @InjectRepository(ClassroomAssignment)
    private classroomAssignmentRepository: Repository<ClassroomAssignment>,
  ) {}

  async create(classroomAssignmentData: Partial<ClassroomAssignment>): Promise<ClassroomAssignment> {
    const classroomAssignment = this.classroomAssignmentRepository.create(classroomAssignmentData);
    return await this.classroomAssignmentRepository.save(classroomAssignment);
  }

  async findByClassroom(classroomId: number): Promise<ClassroomAssignment[]> {
    return await this.classroomAssignmentRepository.find({
      where: { classroom: { id: classroomId } },
      relations: ['assignment', 'classroom'],
    });
  }

  async findByAssignment(assignmentId: number): Promise<ClassroomAssignment[]> {
    return await this.classroomAssignmentRepository.find({
      where: { assignment: { id: assignmentId } },
      relations: ['assignment', 'classroom'],
    });
  }

  async delete(id: number): Promise<void> {
    await this.classroomAssignmentRepository.delete(id);
  }
}
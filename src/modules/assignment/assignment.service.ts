import { Injectable, NotFoundException } from '@nestjs/common';
import { AssignmentRepository } from '../../database/repositories/Assignment.repository';
import { ClassroomAssignmentRepository } from '../../database/repositories/ClassroomAssignment.repository';
import { CreateAssignmentDto, UpdateAssignmentDto, AssignToClassroomDto } from './dto/assignment.dto';
import { Assignment } from '../../database/entities/Assignment.entity';
import { ClassroomAssignment } from '../../database/entities/ClassroomAssignment.entity';
import { Classroom } from '../../database/entities/Classroom.entity';


@Injectable()
export class AssignmentService {
  constructor(
    private assignmentRepository: AssignmentRepository,
    private classroomAssignmentRepository: ClassroomAssignmentRepository
  ) {}

  async create(createAssignmentDto: CreateAssignmentDto): Promise<Assignment> {
    const { classroomIds, dueDate, ...assignmentData } = createAssignmentDto;
    const assignment = await this.assignmentRepository.create(assignmentData);

    if (classroomIds && classroomIds.length > 0) {
      for (const classroomId of classroomIds) {
        const classroomAssignment: Partial<ClassroomAssignment> = {
          assignment: assignment,
          classroom: { id: classroomId } as Classroom,
          dueDate
        };
        await this.classroomAssignmentRepository.create(classroomAssignment);
      }
    }

    return assignment;
  }


  async findAll(): Promise<Assignment[]> {
    return await this.assignmentRepository.findAll();
  }

  async findOne(id: number): Promise<Assignment> {
    const assignment = await this.assignmentRepository.findById(id);
    if (!assignment) {
      throw new NotFoundException(`Assignment with ID "${id}" not found`);
    }
    return assignment;
  }

  async update(id: number, updateAssignmentDto: UpdateAssignmentDto): Promise<Assignment> {
    await this.findOne(id); // Ensure assignment exists
    return await this.assignmentRepository.update(id, updateAssignmentDto);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id); // Ensure assignment exists
    await this.assignmentRepository.delete(id);
  }

  async assignToClassroom(assignToClassroomDto: AssignToClassroomDto): Promise<ClassroomAssignment> {
    return await this.classroomAssignmentRepository.create(assignToClassroomDto);
  }

  async findByClassroom(classroomId: number): Promise<ClassroomAssignment[]> {
    return await this.classroomAssignmentRepository.findByClassroom(classroomId);
  }

  async removeFromClassroom(classroomAssignmentId: number): Promise<void> {
    await this.classroomAssignmentRepository.delete(classroomAssignmentId);
  }
}
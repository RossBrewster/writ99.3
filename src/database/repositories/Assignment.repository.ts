import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assignment } from '../entities/Assignment.entity';
import { Classroom } from '../entities/Classroom.entity';
import { User } from '../entities/User.entity';
import { ClassroomAssignmentRepository } from './ClassroomAssignment.repository';

@Injectable()
export class AssignmentRepository {
  private userRepository: Repository<User>;

  constructor(
    @InjectRepository(Assignment)
    private assignmentRepository: Repository<Assignment>,
    @InjectRepository(Classroom)
    private classroomRepository: Repository<Classroom>,
    @InjectRepository(User)
    userRepository: Repository<User>,
    private classroomAssignmentRepository: ClassroomAssignmentRepository,
  ) {
    this.userRepository = userRepository;
  }

  async create(assignmentData: Partial<Assignment>): Promise<Assignment> {
    console.log('Inserting assignment with data:', assignmentData);
    const assignment = this.assignmentRepository.create(assignmentData);
    return await this.assignmentRepository.save(assignment);
  }

  async findAll(): Promise<Assignment[]> {
    return await this.assignmentRepository.find();
  }

  async findById(id: number, relations: string[] = []): Promise<Assignment | undefined> {
    return await this.assignmentRepository.findOne({ where: { id }, relations });
  }

  async update(id: number, assignmentData: Partial<Assignment>): Promise<Assignment | undefined> {
    await this.assignmentRepository.update(id, assignmentData);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.assignmentRepository.delete(id);
  }

  async findByClassroom(classroomId: number): Promise<Assignment[]> {
    const classroomAssignments = await this.classroomAssignmentRepository.findByClassroom(classroomId);
    return classroomAssignments.map(ca => ca.assignment);
  }

  async findByCreator(userId: number): Promise<Assignment[]> {
    return await this.assignmentRepository.find({
      where: { createdBy: { id: userId } },
      relations: ['createdBy'],
    });
  }

  async findWithSubmissions(assignmentId: number): Promise<Assignment | undefined> {
    return await this.assignmentRepository.findOne({
      where: { id: assignmentId },
      relations: ['submissions'],
    });
  }

  async findWithRubricVersions(assignmentId: number): Promise<Assignment | undefined> {
    return await this.assignmentRepository.findOne({
      where: { id: assignmentId },
      relations: ['rubricVersions'],
    });
  }

  async addAssignmentToClassroom(assignmentId: number, classroomId: number): Promise<Assignment> {
    const assignment = await this.assignmentRepository.findOne({ where: { id: assignmentId } });
    const classroom = await this.classroomRepository.findOne({ where: { id: classroomId } });

    if (!assignment || !classroom) {
      throw new Error('Assignment or Classroom not found');
    }

    await this.classroomAssignmentRepository.create({
      assignment: assignment,
      classroom: classroom,
    });

    return assignment;
  }

  async setCreator(assignmentId: number, userId: number): Promise<Assignment> {
    const assignment = await this.assignmentRepository.findOne({ where: { id: assignmentId } });
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!assignment || !user) {
      throw new Error('Assignment or User not found');
    }

    assignment.createdBy = user;
    return await this.assignmentRepository.save(assignment);
  }

  async findUpcomingAssignments(daysAhead: number = 7): Promise<Assignment[]> {
    const currentDate = new Date();
    const futureDate = new Date(currentDate.getTime() + daysAhead * 24 * 60 * 60 * 1000);
    
    return await this.assignmentRepository.createQueryBuilder('assignment')
      .leftJoinAndSelect('assignment.classroomAssignments', 'classroomAssignment')
      .where('classroomAssignment.dueDate > :currentDate', { currentDate })
      .andWhere('classroomAssignment.dueDate <= :futureDate', { futureDate })
      .orderBy('classroomAssignment.dueDate', 'ASC')
      .getMany();
  }

  async countSubmissions(assignmentId: number): Promise<number> {
    const assignment = await this.findWithSubmissions(assignmentId);
    return assignment ? assignment.submissions.length : 0;
  }
}
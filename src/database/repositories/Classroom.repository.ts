import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';
import { Classroom } from '../entities/Classroom.entity';
import { User } from '../entities/User.entity';
import { UserRepository } from './User.repository';

@Injectable()
export class ClassroomRepository {
  constructor(
    @InjectRepository(Classroom)
    private classroomRepository: Repository<Classroom>,
    private userRepository: UserRepository
  ) {}

  async create(classroomData: Partial<Classroom>): Promise<Classroom> {
    const classroom = this.classroomRepository.create(classroomData);
    return await this.classroomRepository.save(classroom);
  }

  async findAll(): Promise<Classroom[]> {
    return await this.classroomRepository.find();
  }

  async findById(id: number, relations: string[] = []): Promise<Classroom | undefined> {
    if (isNaN(id)) {
      throw new Error('Invalid classroom ID');
    }
    
    try {
      return await this.classroomRepository.findOne({ where: { id }, relations });
    } catch (error) {
      console.error(`Error finding classroom with ID ${id}:`, error);
      throw error;
    }
  }

  async update(id: number, classroomData: Partial<Classroom>): Promise<Classroom | undefined> {
    await this.classroomRepository.update(id, classroomData);
    return this.findById(id);
  }

  async delete(id: number): Promise<DeleteResult> {
    return await this.classroomRepository.delete(id);
  }

  async findByTeacher(teacherId: number): Promise<Classroom[]> {
    return await this.classroomRepository.find({
      where: { teacher: { id: teacherId } },
      relations: ['teacher'],
    });
  }

  async findWithStudents(classroomId: number): Promise<Classroom | undefined> {
    return await this.classroomRepository.findOne({
      where: { id: classroomId },
      relations: ['students'],
    });
  }

  async findWithAssignments(classroomId: number): Promise<Classroom | undefined> {
    return await this.classroomRepository.findOne({
      where: { id: classroomId },
      relations: ['assignments'],
    });
  }

  async addStudent(classroomId: number, studentId: number): Promise<Classroom> {
    const classroom = await this.findWithStudents(classroomId);
    const student = await this.classroomRepository.manager.findOne(User, { where: { id: studentId } });
    
    if (classroom && student) {
      classroom.students.push(student);
      return await this.classroomRepository.save(classroom);
    }
    throw new Error('Classroom or Student not found');
  }

  async removeStudent(classroomId: number, studentId: number): Promise<Classroom> {
    const classroom = await this.findWithStudents(classroomId);
    
    if (classroom) {
      classroom.students = classroom.students.filter(student => student.id !== studentId);
      return await this.classroomRepository.save(classroom);
    }
    throw new Error('Classroom not found');
  }

  async setTeacher(classroomId: number, teacherId: number): Promise<Classroom> {
    const classroom = await this.findById(classroomId);
    const teacher = await this.classroomRepository.manager.findOne(User, { where: { id: teacherId } });
    
    if (classroom && teacher) {
      classroom.teacher = teacher;
      return await this.classroomRepository.save(classroom);
    }
    throw new Error('Classroom or Teacher not found');
  }

  async findByInvitationCode(code: string): Promise<Classroom | undefined> {
    return await this.classroomRepository.findOne({
      where: { invitationCode: code },
    });
  }

  async updateInvitationCode(id: number, code: string, expiration: Date): Promise<Classroom | undefined> {
    await this.classroomRepository.update(id, {
      invitationCode: code,
      invitationCodeExpiration: expiration,
    });
    return this.findById(id);
  }

  async clearInvitationCode(id: number): Promise<Classroom | undefined> {
    await this.classroomRepository.update(id, {
      invitationCode: null,
      invitationCodeExpiration: null,
    });
    return this.findById(id);
  }

  async getRosterData(classroomId: number): Promise<{
    classroom: Classroom;
    teacher: User;
    students: User[];
    studentCount: number;
  }> {
    const classroom = await this.classroomRepository.findOne({
      where: { id: classroomId },
      relations: ['teacher', 'students'],
    });

    if (!classroom) {
      throw new NotFoundException(`Classroom with ID ${classroomId} not found`);
    }

    const teacher = await this.userRepository.findById(classroom.teacherId, ['taughtClassrooms']);
    const students = await Promise.all(
      classroom.students.map(student => 
        this.userRepository.findById(student.id, ['enrolledClassrooms'])
      )
    );

    return {
      classroom,
      teacher,
      students,
      studentCount: students.length,
    };
  }

  async findEnrolledClassroomsByStudent(studentId: number): Promise<Classroom[]> {
    try {
      return this.classroomRepository
        .createQueryBuilder('classroom')
        .innerJoin('classroom.students', 'student')
        .where('student.id = :studentId', { studentId })
        .getMany();
    } catch (error) {
      console.error(`Error finding enrolled classrooms for student ${studentId}:`, error);
      throw error;
    }
  }
}
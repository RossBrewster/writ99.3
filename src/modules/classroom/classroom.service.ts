import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ClassroomRepository } from '../../database/repositories/Classroom.repository';
import { UserRepository } from '../../database/repositories/User.repository';
import { Classroom } from '../../database/entities/Classroom.entity';
import { CreateClassroomDto } from './dto/createClassroom.dto';
import { UpdateClassroomDto } from './dto/updateClassroom.dto';
import { ClassroomDto } from './dto/classroom.dto'; 
import { User } from '../../database/entities/User.entity';
import { RosterDataDto } from './dto/rosterData.dto';

@Injectable()
export class ClassroomService {
  constructor(
    private classroomRepository: ClassroomRepository,
    private userRepository: UserRepository
  ) {}

  async create(createClassroomDto: CreateClassroomDto): Promise<Classroom> {
    const { teacherId, ...classroomData } = createClassroomDto;
    const teacher = await this.userRepository.findById(teacherId);
    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${teacherId} not found`);
    }
    return this.classroomRepository.create({
      ...classroomData,
      teacherId,
      teacher
    });
  }

  async findAll(): Promise<Classroom[]> {
    return this.classroomRepository.findAll();
  }

  async findEnrolledClassrooms(userId: number): Promise<ClassroomDto[]> {
    if (isNaN(userId)) {
      throw new BadRequestException('Invalid user ID');
    }
  
    try {
      const classrooms = await this.classroomRepository.findEnrolledClassroomsByStudent(userId);
      return classrooms.map(ClassroomDto.fromEntity);
    } catch (error) {
      console.error(`Error finding enrolled classrooms for user ${userId}:`, error);
      throw new InternalServerErrorException('Error fetching enrolled classrooms');
    }
  }

  async findOne(id: number): Promise<Classroom> {
    if (isNaN(id)) {
      throw new BadRequestException('Invalid classroom ID');
    }
    
    const classroom = await this.classroomRepository.findById(id);
    if (!classroom) {
      throw new NotFoundException(`Classroom with ID ${id} not found`);
    }
    return classroom;
  }

  async update(id: number, updateClassroomDto: UpdateClassroomDto): Promise<Classroom> {
    const updatedClassroom = await this.classroomRepository.update(id, updateClassroomDto);
    if (!updatedClassroom) {
      throw new NotFoundException(`Classroom with ID ${id} not found`);
    }
    return updatedClassroom;
  }

  async remove(id: number): Promise<void> {
    const result = await this.classroomRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Classroom with ID ${id} not found`);
    }
  }

  async findByTeacher(teacherId: number): Promise<ClassroomDto[]> {
    const classrooms = await this.classroomRepository.findByTeacher(teacherId);
    return classrooms.map(ClassroomDto.fromEntity);
  }

  async addStudent(classroomId: number, studentId: number): Promise<Classroom> {
    return this.classroomRepository.addStudent(classroomId, studentId);
  }

  async removeStudent(classroomId: number, studentId: number): Promise<Classroom> {
    return this.classroomRepository.removeStudent(classroomId, studentId);
  }

  async setTeacher(classroomId: number, teacherId: number): Promise<Classroom> {
    return this.classroomRepository.setTeacher(classroomId, teacherId);
  }

  async generateInvitationCode(classroomId: number): Promise<string> {
    const classroom = await this.classroomRepository.findById(classroomId);
    if (!classroom) {
      throw new Error('Classroom not found');
    }

    const code = this.generateUniqueCode();
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7); // Code expires in 7 days

    await this.classroomRepository.updateInvitationCode(classroomId, code, expirationDate);

    return code;
  }

  async validateInvitationCode(code: string): Promise<Classroom | null> {
    const classroom = await this.classroomRepository.findByInvitationCode(code);

    if (!classroom || classroom.invitationCodeExpiration < new Date()) {
      return null;
    }

    return classroom;
  }

  async clearInvitationCode(classroomId: number): Promise<void> {
    await this.classroomRepository.clearInvitationCode(classroomId);
  }

  private generateUniqueCode(): string {
    // Generate a random 6-digit code
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async getRosterData(classroomId: number): Promise<RosterDataDto> {
    try {
      const rosterData = await this.classroomRepository.getRosterData(classroomId);
      if (!rosterData) {
        throw new NotFoundException(`Classroom with ID ${classroomId} not found`);
      }
      return RosterDataDto.fromEntity(rosterData);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error fetching roster data');
    }
  }
  
  
}
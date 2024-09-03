import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { User } from '../entities/User.entity';
import { Classroom } from '../entities/Classroom.entity';
import { UserResponseDto } from '../../modules/user/dto/user-response.dto';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private entityManager: EntityManager
  ) {}

  // Create
  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return await this.userRepository.save(user);
  }

  // Read
  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findById(id: number, relations: string[] = []): Promise<User | undefined> {
    return await this.userRepository.findOne({ where: { id }, relations });
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async findByRole(role: 'student' | 'teacher' | 'admin'): Promise<User[]> {
    return await this.userRepository.find({ where: { role } });
  }

  // Update
  async update(id: number, userData: Partial<User>): Promise<User | undefined> {
    await this.userRepository.update(id, userData);
    return this.findById(id);
  }

  // Delete
  async delete(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  // Additional methods
  async findWithCreatedAssignments(userId: number): Promise<User | undefined> {
    return await this.userRepository.findOne({
      where: { id: userId },
      relations: ['createdAssignments'],
    });
  }

  async findWithTaughtClassrooms(userId: number): Promise<User | undefined> {
    return await this.userRepository.findOne({
      where: { id: userId },
      relations: ['taughtClassrooms'],
    });
  }

  async findWithEnrolledClassrooms(userId: number): Promise<User | undefined> {
    return await this.userRepository.findOne({
      where: { id: userId },
      relations: ['enrolledClassrooms'],
    });
  }

  async addStudentToClassroom(userId: number, classroomId: number): Promise<User> {
    const user = await this.findById(userId, ['enrolledClassrooms']);
    const classroom = await this.userRepository.manager.findOne(Classroom, { where: { id: classroomId } });
    
    if (user && classroom) {
      user.enrolledClassrooms.push(classroom);
      return await this.userRepository.save(user);
    }
    throw new Error('User or Classroom not found');
  }

  async removeStudentFromClassroom(userId: number, classroomId: number): Promise<User> {
    const user = await this.findById(userId, ['enrolledClassrooms']);
    
    if (user) {
      user.enrolledClassrooms = user.enrolledClassrooms.filter(classroom => classroom.id !== classroomId);
      return await this.userRepository.save(user);
    }
    throw new Error('User not found');
  }

  async findTeachersWithClassrooms(): Promise<User[]> {
    return await this.userRepository.find({
      where: { role: 'teacher' },
      relations: ['taughtClassrooms'],
    });
  }

  async findStudentsWithEnrollments(): Promise<User[]> {
    return await this.userRepository.find({
      where: { role: 'student' },
      relations: ['enrolledClassrooms'],
    });
  }

  async countAssignmentsCreatedByUser(userId: number): Promise<number> {
    const user = await this.findById(userId, ['createdAssignments']);
    return user ? user.createdAssignments.length : 0;
  }

  async searchByUsername(username: string): Promise<User[]> {
    return await this.userRepository.createQueryBuilder('user')
      .where('user.username LIKE :username', { username: `%${username}%` })
      .getMany();
  }

  async joinClassroomByInvitationCode(userId: number, invitationCode: string): Promise<UserResponseDto> {
    return this.entityManager.transaction(async transactionalEntityManager => {
      const user = await transactionalEntityManager.findOne(User, {
        where: { id: userId },
        relations: ['enrolledClassrooms']
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const classroom = await transactionalEntityManager.findOne(Classroom, {
        where: { invitationCode },
        relations: ['students']
      });

      if (!classroom) {
        throw new BadRequestException('Invalid invitation code');
      }

      if (classroom.invitationCodeExpiration && classroom.invitationCodeExpiration < new Date()) {
        throw new BadRequestException('Invitation code has expired');
      }

      if (user.enrolledClassrooms.some(c => c.id === classroom.id)) {
        throw new BadRequestException('User is already enrolled in this classroom');
      }

      user.enrolledClassrooms.push(classroom);
      classroom.students.push(user);

      // Clear the invitation code after successful join
      // classroom.invitationCode = null;
      // classroom.invitationCodeExpiration = null;

      await transactionalEntityManager.save(classroom);
      await transactionalEntityManager.save(user);

      return UserResponseDto.fromEntity(user);
    });
  }

}
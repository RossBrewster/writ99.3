import { User } from '../../../database/entities/User.entity';

export class UserResponseDto {
  id: number;
  username: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  enrolledClassroomIds: number[];

  static fromEntity(user: User): UserResponseDto {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      enrolledClassroomIds: user.enrolledClassrooms ? user.enrolledClassrooms.map(c => c.id) : []
    };
  }
}
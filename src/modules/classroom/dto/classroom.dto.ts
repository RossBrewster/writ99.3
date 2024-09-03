import { UserResponseDto } from '../../user/dto/user-response.dto';
import { Classroom } from '../../../database/entities/Classroom.entity';

export class ClassroomDto {
  id: number;
  name: string;
  description: string;
  teacherId: number;
  invitationCode: string | null;
  invitationCodeExpiration: Date | null;
  teacher?: UserResponseDto;  // Make this optional

  static fromEntity(classroom: Classroom): ClassroomDto {
    const dto = new ClassroomDto();
    dto.id = classroom.id;
    dto.name = classroom.name;
    dto.description = classroom.description;
    dto.teacherId = classroom.teacherId;
    dto.invitationCode = classroom.invitationCode;
    dto.invitationCodeExpiration = classroom.invitationCodeExpiration;
    
    // Only set the teacher if it's loaded
    if (classroom.teacher) {
      dto.teacher = UserResponseDto.fromEntity(classroom.teacher);
    }
    
    return dto;
  }
}
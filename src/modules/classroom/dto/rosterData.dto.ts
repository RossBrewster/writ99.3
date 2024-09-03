import { RosterUserDto } from './rosterUser.dto';
import { RosterClassroomDto } from './rosterClassroom.dto';

export class RosterDataDto {
  classroom: RosterClassroomDto;
  teacher: RosterUserDto;
  students: RosterUserDto[];
  studentCount: number;

  static fromEntity(data: any): RosterDataDto {
    const dto = new RosterDataDto();
    dto.classroom = RosterClassroomDto.fromEntity(data.classroom);
    dto.teacher = RosterUserDto.fromEntity(data.teacher);
    dto.students = data.students.map(RosterUserDto.fromEntity);
    dto.studentCount = data.studentCount;
    return dto;
  }
}
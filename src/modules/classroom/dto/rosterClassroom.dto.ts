export class RosterClassroomDto {
    id: number;
    name: string;
    description: string;
    teacherId: number;
    invitationCode: string | null;
    invitationCodeExpiration: Date | null;
  
    static fromEntity(classroom: any): RosterClassroomDto {
      const dto = new RosterClassroomDto();
      dto.id = classroom.id;
      dto.name = classroom.name;
      dto.description = classroom.description;
      dto.teacherId = classroom.teacherId;
      dto.invitationCode = classroom.invitationCode;
      dto.invitationCodeExpiration = classroom.invitationCodeExpiration;
      return dto;
    }
  }
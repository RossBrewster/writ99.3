export class RosterUserDto {
    id: number;
    username: string;
    email: string;
    role: string;
  
    static fromEntity(user: any): RosterUserDto {
      const dto = new RosterUserDto();
      dto.id = user.id;
      dto.username = user.username;
      dto.email = user.email;
      dto.role = user.role;
      return dto;
    }
  }
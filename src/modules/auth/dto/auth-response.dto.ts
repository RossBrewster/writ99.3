// src/modules/auth/dto/auth-response.dto.ts
export class AuthResponseDto {
    id: number;
    username: string;
    email: string;
    role: 'student' | 'teacher' | 'admin';
    token: string;
  }
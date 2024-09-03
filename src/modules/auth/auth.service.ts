import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../../database/repositories/User.repository';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
    private configService: ConfigService,

  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userRepository.findByEmail(loginDto.email);
    if (user && await bcrypt.compare(loginDto.password, user.passwordHash)) {
      const payload = {
        username: user.username,
        sub: user.id,
        role: user.role
      };
      const token = this.jwtService.sign(payload);
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: token
      };
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async register(registerDto: RegisterUserDto): Promise<AuthResponseDto> {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.userRepository.create({
      ...registerDto,
      passwordHash: hashedPassword,
    });
    
    const payload = { username: user.username, sub: user.id, role: user.role };
    const token = this.jwtService.sign(payload);
    
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: token
    };
  }

  async logout(req: Request, res: Response) {
    // Clear the JWT token from the client-side
    res.clearCookie('jwt');
    
    // You might want to perform additional actions here, such as:
    // - Invalidating the token on the server-side (if you're keeping a blacklist)
    // - Logging the logout action
    // - Clearing any server-side sessions (if you're using them)

    return res.status(200).json({ message: 'Logged out successfully' });
  }

  async checkAuth(user: any) {
    // The user object is attached to the request by the JwtAuthGuard
    if (!user) {
      throw new UnauthorizedException();
    }
    return {
      id: user.userId,
      username: user.username,
      role: user.role
    };
  }
}
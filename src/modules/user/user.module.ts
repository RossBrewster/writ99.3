import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../database/entities/User.entity';
import { Classroom } from '../../database/entities/Classroom.entity';
import { Assignment } from '../../database/entities/Assignment.entity';
import { UserRepository } from '../../database/repositories/User.repository';
import { UserService } from './user.service'
import { UserController } from './user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Classroom, Assignment])],
  providers: [UserRepository, UserService],
  controllers: [UserController],
  exports: [UserService, UserRepository],
})
export class UserModule {}
import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../../database/entities/User.entity';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  async createUser(@Body() userData: Partial<User>): Promise<User> {
    return this.userService.createUser(userData);
  }

  @Get()
  async getAllUsers(): Promise<User[]> {
    return this.userService.getAllUsers();
  }

  @Get(':id')
  async getUserById(@Param('id') id: number): Promise<User> {
    return this.userService.getUserById(id);
  }

  @Put(':id')
  async updateUser(@Param('id') id: number, @Body() userData: Partial<User>): Promise<User> {
    return this.userService.updateUser(id, userData);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: number): Promise<void> {
    return this.userService.deleteUser(id);
  }

  @Get(':id/enrollments')
  async getUserWithEnrollments(@Param('id') id: number): Promise<User> {
    return this.userService.getUserWithEnrollments(id);
  }

  @Post(':userId/enroll/:classroomId')
  async enrollStudentInClassroom(
    @Param('userId') userId: number,
    @Param('classroomId') classroomId: number
  ): Promise<User> {
    return this.userService.enrollStudentInClassroom(userId, classroomId);
  }

  @Get('teachers/with-classrooms')
  async getTeachersWithClassrooms(): Promise<User[]> {
    return this.userService.getTeachersWithClassrooms();
  }

  @Get('students/with-enrollments')
  async getStudentsWithEnrollments(): Promise<User[]> {
    return this.userService.getStudentsWithEnrollments();
  }
}
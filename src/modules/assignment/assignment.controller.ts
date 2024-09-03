import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AssignmentService } from './assignment.service';
import { CreateAssignmentDto, UpdateAssignmentDto, AssignToClassroomDto } from './dto/assignment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) {}
  
  @Post()
  @Roles('teacher', 'admin')
  async create(@Body() createAssignmentDto: CreateAssignmentDto) {
    return await this.assignmentService.create(createAssignmentDto);
  }

  @Get()
  @Roles('teacher', 'admin', 'student')
  async findAll() {
    return await this.assignmentService.findAll();
  }

  @Get(':id')
  @Roles('teacher', 'admin', 'student')
  async findOne(@Param('id') id: string) {
    return await this.assignmentService.findOne(+id);
  }

  @Put(':id')
  @Roles('teacher', 'admin')
  async update(@Param('id') id: string, @Body() updateAssignmentDto: UpdateAssignmentDto) {
    return await this.assignmentService.update(+id, updateAssignmentDto);
  }

  @Delete(':id')
  @Roles('teacher', 'admin')
  async remove(@Param('id') id: string) {
    await this.assignmentService.remove(+id);
    return { message: 'Assignment deleted successfully' };
  }

  @Post('assign-to-classroom')
  @Roles('teacher', 'admin')
  async assignToClassroom(@Body() assignToClassroomDto: AssignToClassroomDto) {
    return await this.assignmentService.assignToClassroom(assignToClassroomDto);
  }

  @Get('classroom/:classroomId')
  @Roles('teacher', 'admin', 'student')
  async findByClassroom(@Param('classroomId') classroomId: string) {
    return await this.assignmentService.findByClassroom(+classroomId);
  }

  @Delete('classroom-assignment/:id')
  @Roles('teacher', 'admin')
  async removeFromClassroom(@Param('id') id: string) {
    await this.assignmentService.removeFromClassroom(+id);
    return { message: 'Assignment removed from classroom successfully' };
  }
}
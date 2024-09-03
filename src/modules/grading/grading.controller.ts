import { Controller, Post, Get, Put, Param, Body, UseGuards } from '@nestjs/common';
import { AIGradingService } from './grading.service';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/roles.guard';
// import { Roles } from '../auth/decorators/roles.decorator';

@Controller('grading')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class GradingController {
  constructor(private readonly gradingService: AIGradingService) {}

  @Post('submissions/:id/grade')
  // @Roles('teacher', 'admin')
  async gradeSubmission(@Param('id') id: string) {
    await this.gradingService.gradeSubmission(parseInt(id, 10));
    return { message: 'Submission graded successfully' };
  }

  @Get('submissions/:id/grade')
  // @Roles('teacher', 'admin', 'student')
  async getSubmissionGrade(@Param('id') id: string) {
    return await this.gradingService.getSubmissionGrade(parseInt(id, 10));
  }

  @Get('assignments/:id/grades')
  // @Roles('teacher', 'admin')
  async getAssignmentGrades(@Param('id') id: string) {
    return await this.gradingService.getAssignmentGrades(parseInt(id, 10));
  }

  @Put('feedback/:id/review')
  // @Roles('teacher', 'admin')
  async reviewAIGrading(
    @Param('id') id: string,
    @Body('score') score: number,
    @Body('teacherFeedback') teacherFeedback: string
  ) {
    await this.gradingService.reviewAIGrading(parseInt(id, 10), score, teacherFeedback);
    return { message: 'Feedback reviewed successfully' };
  }

  @Post('assignments/:id/regrade')
  // @Roles('teacher', 'admin')
  async regradeAssignment(@Param('id') id: string) {
    await this.gradingService.regradeAssignment(parseInt(id, 10));
    return { message: 'Assignment regraded successfully' };
  }
}
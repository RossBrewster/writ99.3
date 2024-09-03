import { Controller, Get, Post, Put, Body, Param, UseGuards, Logger, NotFoundException } from '@nestjs/common';
import { SubmissionService } from './submission.service';
import { CreateSubmissionDto, UpdateSubmissionDto } from './dto/submission.dto';

@Controller('submissions')
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  private readonly logger = new Logger(SubmissionController.name);

  @Post()
  async create(@Body() createSubmissionDto: CreateSubmissionDto) {
    return await this.submissionService.create(createSubmissionDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.submissionService.findOne(+id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateSubmissionDto: UpdateSubmissionDto) {
    return await this.submissionService.update(+id, updateSubmissionDto);
  }

  @Get('assignment/:assignmentId')
  async findByAssignment(@Param('assignmentId') assignmentId: string) {
    return await this.submissionService.findByAssignment(+assignmentId);
  }

  @Get('student/:studentId')
  async getSubmissionsByStudent(@Param('studentId') studentId: string) {
    this.logger.log(`Fetching submissions for student ID: ${studentId}`);

    // Validate studentId is a number
    if (isNaN(+studentId)) {
      this.logger.error(`Invalid student ID provided: ${studentId}`);
      throw new NotFoundException('Invalid student ID');
    }

    try {
      const submissions = await this.submissionService.getSubmissionsByStudent(+studentId);
      
      this.logger.log(`Found ${submissions.length} submissions for student ID: ${studentId}`);
      
      if (submissions.length === 0) {
        this.logger.warn(`No submissions found for student ID: ${studentId}`);
      }
      
      return submissions;
    } catch (error) {
      this.logger.error(`Error fetching submissions for student ID ${studentId}: ${error.message}`);
      throw error;
    }
  }
}
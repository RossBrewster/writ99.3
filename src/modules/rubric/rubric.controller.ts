import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, NotFoundException } from '@nestjs/common';
import { RubricService } from './rubric.service';
import { CreateRubricTemplateDto, UpdateRubricTemplateDto, CreateRubricCriteriaDto, UpdateRubricCriteriaDto } from './dto/rubric.dto';

@Controller('rubrics')
export class RubricController {
  constructor(private readonly rubricService: RubricService) {}

  @Post('templates')
  async createTemplate(@Body() createRubricTemplateDto: CreateRubricTemplateDto) {
    return await this.rubricService.createTemplate(createRubricTemplateDto);
  }

  @Get('templates')
  async findAllTemplates() {
    return await this.rubricService.findAllTemplates();
  }

  @Get('templates/:id')
  async findOneTemplate(@Param('id') id: string) {
    const template = await this.rubricService.findOneTemplate(+id);
    if (!template) {
      throw new NotFoundException(`Rubric template with ID ${id} not found`);
    }
    return template;
  }

  @Put('templates/:id')
  async updateTemplate(@Param('id') id: string, @Body() updateRubricTemplateDto: UpdateRubricTemplateDto) {
    return await this.rubricService.updateTemplate(+id, updateRubricTemplateDto);
  }

  @Delete('templates/:id')
  async deleteTemplate(@Param('id') id: string) {
    await this.rubricService.deleteTemplate(+id);
    return { message: `Rubric template with ID ${id} has been deleted` };
  }

  @Post('criteria')
  async createCriteria(@Body() createRubricCriteriaDto: CreateRubricCriteriaDto) {
    return await this.rubricService.createCriteria(createRubricCriteriaDto);
  }

  @Get('criteria/:id')
  async findOneCriteria(@Param('id') id: string) {
    const criteria = await this.rubricService.findOneCriteria(+id);
    if (!criteria) {
      throw new NotFoundException(`Rubric criteria with ID ${id} not found`);
    }
    return criteria;
  }

  @Put('criteria/:id')
  async updateCriteria(@Param('id') id: string, @Body() updateRubricCriteriaDto: UpdateRubricCriteriaDto) {
    return await this.rubricService.updateCriteria(+id, updateRubricCriteriaDto);
  }

  @Delete('criteria/:id')
  async deleteCriteria(@Param('id') id: string) {
    await this.rubricService.deleteCriteria(+id);
    return { message: `Rubric criteria with ID ${id} has been deleted` };
  }

  @Get('templates/:id/criteria')
  async findCriteriaForTemplate(@Param('id') id: string) {
    return await this.rubricService.findCriteriaForTemplate(+id);
  }

  @Put('criteria/:id/template')
  async setCriteriaTemplate(@Param('id') id: string, @Body('templateId') templateId: number) {
    return await this.rubricService.setCriteriaTemplate(+id, templateId);
}
}
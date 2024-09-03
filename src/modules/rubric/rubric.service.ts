import { Injectable, NotFoundException } from '@nestjs/common';
import { RubricTemplateRepository } from '../../database/repositories/RubricTemplate.repository';
import { RubricCriteriaRepository } from '../../database/repositories/RubricCriteria.repository';
import { CreateRubricTemplateDto, UpdateRubricTemplateDto, CreateRubricCriteriaDto, UpdateRubricCriteriaDto } from './dto/rubric.dto';

@Injectable()
export class RubricService {
  constructor(
    private rubricTemplateRepository: RubricTemplateRepository,
    private rubricCriteriaRepository: RubricCriteriaRepository
  ) {}

  async createTemplate(createRubricTemplateDto: CreateRubricTemplateDto) {
    const template = {
      ...createRubricTemplateDto,
      createdDate: new Date(createRubricTemplateDto.createdDate)
    };
    return await this.rubricTemplateRepository.create(template);
  }
  
  async findAllTemplates() {
    return await this.rubricTemplateRepository.findAll();
  }

  async findOneTemplate(id: number) {
    const template = await this.rubricTemplateRepository.findById(id);
    if (!template) {
      throw new NotFoundException(`Rubric template with ID ${id} not found`);
    }
    return template;
  }

  async updateTemplate(id: number, updateRubricTemplateDto: UpdateRubricTemplateDto) {
    const template = await this.rubricTemplateRepository.findById(id);
    if (!template) {
      throw new NotFoundException(`Rubric template with ID ${id} not found`);
    }
    return await this.rubricTemplateRepository.update(id, updateRubricTemplateDto);
  }

  async deleteTemplate(id: number) {
    const template = await this.rubricTemplateRepository.findById(id);
    if (!template) {
      throw new NotFoundException(`Rubric template with ID ${id} not found`);
    }
    await this.rubricTemplateRepository.delete(id);
  }

  async createCriteria(createRubricCriteriaDto: CreateRubricCriteriaDto) {
    return await this.rubricCriteriaRepository.create(createRubricCriteriaDto);
  }

  async findOneCriteria(id: number) {
    const criteria = await this.rubricCriteriaRepository.findById(id);
    if (!criteria) {
      throw new NotFoundException(`Rubric criteria with ID ${id} not found`);
    }
    return criteria;
  }

  async updateCriteria(id: number, updateRubricCriteriaDto: UpdateRubricCriteriaDto) {
    const criteria = await this.rubricCriteriaRepository.findById(id);
    if (!criteria) {
      throw new NotFoundException(`Rubric criteria with ID ${id} not found`);
    }

    if (updateRubricCriteriaDto.templateId !== undefined) {
      await this.rubricCriteriaRepository.setTemplate(id, updateRubricCriteriaDto.templateId);
    }

    const updateData = { ...updateRubricCriteriaDto };
    delete updateData.templateId;

    if (Object.keys(updateData).length > 0) {
      await this.rubricCriteriaRepository.update(id, updateData);
    }

    // Fetch and return the updated criteria
    return await this.rubricCriteriaRepository.findById(id, ['template']);
  }

  async deleteCriteria(id: number) {
    const criteria = await this.rubricCriteriaRepository.findById(id);
    if (!criteria) {
      throw new NotFoundException(`Rubric criteria with ID ${id} not found`);
    }
    await this.rubricCriteriaRepository.delete(id);
  }

    async setCriteriaTemplate(criteriaId: number, templateId: number) {
        return await this.rubricCriteriaRepository.setTemplate(criteriaId, templateId);
    }

  async findCriteriaForTemplate(templateId: number) {
    const template = await this.rubricTemplateRepository.findById(templateId);
    if (!template) {
      throw new NotFoundException(`Rubric template with ID ${templateId} not found`);
    }
    return await this.rubricCriteriaRepository.findByTemplateId(templateId);
  }

  
}
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RubricTemplate } from '../entities/RubricTemplate.entity';
import { User } from '../entities/User.entity';

@Injectable()
export class RubricTemplateRepository {
  constructor(
    @InjectRepository(RubricTemplate)
    private rubricTemplateRepository: Repository<RubricTemplate>,
  ) {}

  async create(templateData: Partial<RubricTemplate>): Promise<RubricTemplate> {
    const template = this.rubricTemplateRepository.create(templateData);
    return await this.rubricTemplateRepository.save(template);
  }

  async findAll(): Promise<RubricTemplate[]> {
    return await this.rubricTemplateRepository.find();
  }

  async findById(id: number, relations: string[] = []): Promise<RubricTemplate | undefined> {
    return await this.rubricTemplateRepository.findOne({ where: { id }, relations });
  }

  async update(id: number, templateData: Partial<RubricTemplate>): Promise<RubricTemplate | undefined> {
    await this.rubricTemplateRepository.update(id, templateData);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.rubricTemplateRepository.delete(id);
  }

  async findByCreator(creatorId: number): Promise<RubricTemplate[]> {
    return await this.rubricTemplateRepository.find({
      where: { createdBy: { id: creatorId } },
      relations: ['createdBy'],
    });
  }

  async findWithCriteria(templateId: number): Promise<RubricTemplate | undefined> {
    return await this.rubricTemplateRepository.findOne({
      where: { id: templateId },
      relations: ['criteria'],
    });
  }

  async findWithVersions(templateId: number): Promise<RubricTemplate | undefined> {
    return await this.rubricTemplateRepository.findOne({
      where: { id: templateId },
      relations: ['versions'],
    });
  }

  async setCreator(templateId: number, creatorId: number): Promise<RubricTemplate> {
    const template = await this.findById(templateId);
    const creator = await this.rubricTemplateRepository.manager.findOne(User, { where: { id: creatorId } });
    
    if (template && creator) {
      template.createdBy = creator;
      return await this.rubricTemplateRepository.save(template);
    }
    throw new Error('RubricTemplate or User not found');
  }
}
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RubricCriteria } from '../entities/RubricCriteria.entity';
import { RubricTemplate } from '../entities/RubricTemplate.entity';

@Injectable()
export class RubricCriteriaRepository {
  constructor(
    @InjectRepository(RubricCriteria)
    private rubricCriteriaRepository: Repository<RubricCriteria>,
  ) {}

  async create(criteriaData: Partial<RubricCriteria>): Promise<RubricCriteria> {
    const criteria = this.rubricCriteriaRepository.create(criteriaData);
    return await this.rubricCriteriaRepository.save(criteria);
  }

  async findAll(): Promise<RubricCriteria[]> {
    return await this.rubricCriteriaRepository.find();
  }

  async findById(id: number, relations: string[] = []): Promise<RubricCriteria | undefined> {
    return await this.rubricCriteriaRepository.findOne({
      where: { id },
      relations,
    });
  }

  async setTemplate(criteriaId: number, templateId: number): Promise<RubricCriteria> {
    const criteria = await this.findById(criteriaId);
    if (!criteria) {
      throw new Error('RubricCriteria not found');
    }

    const template = await this.rubricCriteriaRepository.manager.findOne(RubricTemplate, { where: { id: templateId } });
    if (!template) {
      throw new Error('RubricTemplate not found');
    }

    criteria.template = template;
    return await this.rubricCriteriaRepository.save(criteria);
  }


  async update(id: number, criteriaData: Partial<RubricCriteria>): Promise<RubricCriteria | undefined> {
    await this.rubricCriteriaRepository.update(id, criteriaData);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.rubricCriteriaRepository.delete(id);
  }

  async findByTemplateId(templateId: number): Promise<RubricCriteria[]> {
    return await this.rubricCriteriaRepository.find({
      where: { template: { id: templateId } },
      relations: ['template'],
    });
  }

  async findWithExamples(criteriaId: number): Promise<RubricCriteria | undefined> {
    return await this.rubricCriteriaRepository.findOne({
      where: { id: criteriaId },
      relations: ['examples'],
    });
  }

  async addToTemplate(criteriaId: number, templateId: number): Promise<RubricCriteria> {
    const criteria = await this.findById(criteriaId);
    const template = await this.rubricCriteriaRepository.manager.findOne(RubricTemplate, { where: { id: templateId } });
    
    if (criteria && template) {
      criteria.template = template;
      return await this.rubricCriteriaRepository.save(criteria);
    }
    throw new Error('RubricCriteria or RubricTemplate not found');
  }

  async updateMaxScore(criteriaId: number, maxScore: number): Promise<RubricCriteria | undefined> {
    const criteria = await this.findById(criteriaId);
    if (criteria) {
      criteria.maxScore = maxScore;
      return await this.rubricCriteriaRepository.save(criteria);
    }
    throw new Error('RubricCriteria not found');
  }
}
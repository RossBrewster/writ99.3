import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RubricVersion } from '../entities/RubricVersion.entity';
import { Assignment } from '../entities/Assignment.entity';
import { RubricTemplate } from '../entities/RubricTemplate.entity';

@Injectable()
export class RubricVersionRepository {
  constructor(
    @InjectRepository(RubricVersion)
    private rubricVersionRepository: Repository<RubricVersion>,
  ) {}

  async create(versionData: Partial<RubricVersion>): Promise<RubricVersion> {
    const version = this.rubricVersionRepository.create(versionData);
    return await this.rubricVersionRepository.save(version);
  }

  async findAll(): Promise<RubricVersion[]> {
    return await this.rubricVersionRepository.find();
  }

  async findById(id: number, relations: string[] = []): Promise<RubricVersion | undefined> {
    return await this.rubricVersionRepository.findOne({ where: { id }, relations });
  }

  async update(id: number, versionData: Partial<RubricVersion>): Promise<RubricVersion | undefined> {
    await this.rubricVersionRepository.update(id, versionData);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.rubricVersionRepository.delete(id);
  }

  async findByAssignment(assignmentId: number): Promise<RubricVersion[]> {
    return await this.rubricVersionRepository.find({
      where: { assignment: { id: assignmentId } },
      relations: ['assignment'],
    });
  }

  async findActiveByAssignment(assignmentId: number): Promise<RubricVersion | undefined> {
    return await this.rubricVersionRepository.findOne({
      where: { assignment: { id: assignmentId }, isActive: true },
      relations: ['assignment', 'template'],
    });
  }

  async setActiveVersion(versionId: number, assignmentId: number): Promise<RubricVersion> {
    // First, deactivate all versions for this assignment
    await this.rubricVersionRepository.update(
      { assignment: { id: assignmentId } },
      { isActive: false }
    );

    // Then, activate the specified version
    const version = await this.findById(versionId);
    if (version) {
      version.isActive = true;
      return await this.rubricVersionRepository.save(version);
    }
    throw new Error('RubricVersion not found');
  }

  async createNewVersion(assignmentId: number, templateId: number): Promise<RubricVersion> {
    const assignment = await this.rubricVersionRepository.manager.findOne(Assignment, { where: { id: assignmentId } });
    const template = await this.rubricVersionRepository.manager.findOne(RubricTemplate, { where: { id: templateId } });

    if (assignment && template) {
      const latestVersion = await this.rubricVersionRepository.findOne({
        where: { assignment: { id: assignmentId } },
        order: { versionNumber: 'DESC' },
      });

      const newVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

      const newVersion = this.rubricVersionRepository.create({
        assignment,
        template,
        versionNumber: newVersionNumber,
        isActive: true,
        createdDate: new Date(),
      });

      // Deactivate previous versions
      await this.rubricVersionRepository.update(
        { assignment: { id: assignmentId } },
        { isActive: false }
      );

      return await this.rubricVersionRepository.save(newVersion);
    }
    throw new Error('Assignment or RubricTemplate not found');
  }
}
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from '../entities/Feedback.entity';
import { StudentSubmission } from '../entities/StudentSubmission.entity';
import { RubricCriteria } from '../entities/RubricCriteria.entity';
import { RubricVersion } from '../entities/RubricVersion.entity';

@Injectable()
export class FeedbackRepository {
  constructor(
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
  ) {}

  async create(feedbackData: Partial<Feedback>): Promise<Feedback> {
    const feedback = this.feedbackRepository.create(feedbackData);
    return await this.feedbackRepository.save(feedback);
  }

  async findAll(): Promise<Feedback[]> {
    return await this.feedbackRepository.find();
  }

  async findById(id: number, relations: string[] = []): Promise<Feedback | undefined> {
    return await this.feedbackRepository.findOne({ where: { id }, relations });
  }

  async update(id: number, feedbackData: Partial<Feedback>): Promise<Feedback | undefined> {
    await this.feedbackRepository.update(id, feedbackData);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.feedbackRepository.delete(id);
  }

  async findBySubmission(submissionId: number): Promise<Feedback[]> {
    return await this.feedbackRepository.find({
      where: { submission: { id: submissionId } },
      relations: ['submission', 'criteria', 'rubricVersion'],
    });
  }

  async findByCriteria(criteriaId: number): Promise<Feedback[]> {
    return await this.feedbackRepository.find({
      where: { criteria: { id: criteriaId } },
      relations: ['submission', 'criteria', 'rubricVersion'],
    });
  }

  async findByRubricVersion(versionId: number): Promise<Feedback[]> {
    return await this.feedbackRepository.find({
      where: { rubricVersion: { id: versionId } },
      relations: ['submission', 'criteria', 'rubricVersion'],
    });
  }

  async createFeedback(
    submissionId: number,
    criteriaId: number,
    versionId: number,
    aiFeedback: string,
    score: number
  ): Promise<Feedback> {
    const submission = await this.feedbackRepository.manager.findOne(StudentSubmission, { where: { id: submissionId } });
    const criteria = await this.feedbackRepository.manager.findOne(RubricCriteria, { where: { id: criteriaId } });
    const rubricVersion = await this.feedbackRepository.manager.findOne(RubricVersion, { where: { id: versionId } });

    if (submission && criteria && rubricVersion) {
      const feedback = this.feedbackRepository.create({
        submission,
        criteria,
        rubricVersion,
        aiFeedback,
        score,
        feedbackDate: new Date(),
      });
      return await this.feedbackRepository.save(feedback);
    }
    throw new Error('Submission, RubricCriteria, or RubricVersion not found');
  }

  async updateTeacherFeedback(feedbackId: number, teacherFeedback: string): Promise<Feedback | undefined> {
    const feedback = await this.findById(feedbackId);
    if (feedback) {
      feedback.teacherFeedback = teacherFeedback;
      return await this.feedbackRepository.save(feedback);
    }
    throw new Error('Feedback not found');
  }
}
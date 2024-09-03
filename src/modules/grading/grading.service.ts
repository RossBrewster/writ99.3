import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { FeedbackRepository } from '../../database/repositories/Feedback.repository';
import { StudentSubmissionRepository } from '../../database/repositories/StudentSubmission.repository';
import { RubricCriteriaRepository } from '../../database/repositories/RubricCriteria.repository';
import { RubricVersionRepository } from '../../database/repositories/RubricVersion.repository';
import { AssignmentRepository } from '../../database/repositories/Assignment.repository';
import Anthropic from '@anthropic-ai/sdk';

@Injectable()
export class AIGradingService {
  private anthropic: Anthropic;

  constructor(
    private feedbackRepository: FeedbackRepository,
    private studentSubmissionRepository: StudentSubmissionRepository,
    private rubricCriteriaRepository: RubricCriteriaRepository,
    private rubricVersionRepository: RubricVersionRepository,
    private assignmentRepository: AssignmentRepository,
  ) {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async gradeSubmission(submissionId: number): Promise<void> {
    const submission = await this.studentSubmissionRepository.findById(submissionId, ['assignment']);
    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    const activeRubricVersion = await this.rubricVersionRepository.findActiveByAssignment(submission.assignment.id);
    if (!activeRubricVersion) {
      throw new BadRequestException('No active rubric version found for this assignment');
    }

    const rubricCriteria = await this.rubricCriteriaRepository.findByTemplateId(activeRubricVersion.template.id);

    const messages: Anthropic.MessageParam[] = [
      { role: 'user', content: `You are grading a student submission for the assignment: "${submission.assignment.title}". Here's the submission content: "${submission.content}"` },
      { role: 'user', content: "I will now provide you with the grading criteria. For each criterion, provide a score and detailed feedback." },
      ...rubricCriteria.map(criterion => ({
        role: 'user' as const,
        content: `Criterion: ${criterion.name}\nDescription: ${criterion.description}\nMax Score: ${criterion.maxScore}\nPlease provide the score and feedback for this criterion in the format: "Score: [score]\nFeedback: [detailed feedback]"`
      }))
    ];

    try {
      const aiResponse = await this.anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1024,
        messages,
      });

      let fullResponse = '';
      for (const block of aiResponse.content) {
        if (block.type === 'text') {
          fullResponse += block.text;
        }
      }

      const criteriaResponses = fullResponse.split('\n\n');
      
      for (let i = 0; i < rubricCriteria.length; i++) {
        const criterion = rubricCriteria[i];
        const response = criteriaResponses[i];
        const [scoreLine, ...feedbackLines] = response.split('\n');
        const score = parseInt(scoreLine.split(':')[1].trim(), 10);
        const feedback = feedbackLines.join('\n').replace('Feedback:', '').trim();

        await this.feedbackRepository.create({
          submission,
          criteria: criterion,
          rubricVersion: activeRubricVersion,
          score,
          aiFeedback: feedback,
          feedbackDate: new Date(),
        });
      }

      await this.studentSubmissionRepository.update(submissionId, { draftNumber: submission.draftNumber + 1 });
    } catch (error) {
      console.error('Error during AI grading:', error);
      throw new BadRequestException('Failed to complete AI grading');
    }
  }

  async getSubmissionGrade(submissionId: number): Promise<any> {
    const feedback = await this.feedbackRepository.findBySubmission(submissionId);
    if (feedback.length === 0) {
      throw new NotFoundException('No feedback found for this submission');
    }

    const totalScore = feedback.reduce((sum, fb) => sum + fb.score, 0);
    const maxPossibleScore = feedback.reduce((sum, fb) => sum + fb.criteria.maxScore, 0);

    return {
      submissionId,
      feedback,
      totalScore,
      maxPossibleScore,
      percentage: (totalScore / maxPossibleScore) * 100,
    };
  }

  async reviewAIGrading(feedbackId: number, score: number, teacherFeedback: string): Promise<void> {
    const feedback = await this.feedbackRepository.findById(feedbackId);
    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    await this.feedbackRepository.update(feedbackId, {
      score,
      teacherFeedback,
    });
  }

  async getAssignmentGrades(assignmentId: number): Promise<any> {
    const submissions = await this.studentSubmissionRepository.findByAssignmentId(assignmentId);
    const grades = await Promise.all(
      submissions.map(async (submission) => {
        try {
          return await this.getSubmissionGrade(submission.id);
        } catch (error) {
          console.error(`Error getting grade for submission ${submission.id}:`, error);
          return null;
        }
      })
    );

    return grades.filter(grade => grade !== null);
  }

  async regradeAssignment(assignmentId: number): Promise<void> {
    const submissions = await this.studentSubmissionRepository.findByAssignmentId(assignmentId);
    for (const submission of submissions) {
      await this.gradeSubmission(submission.id);
    }
  }
}
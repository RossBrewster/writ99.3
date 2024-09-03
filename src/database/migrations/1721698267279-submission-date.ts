import { MigrationInterface, QueryRunner } from "typeorm";

export class SubmissionDate1721698267279 implements MigrationInterface {
    name = 'SubmissionDate1721698267279'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "student_submission" ALTER COLUMN "submissionDate" SET DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "student_submission" ALTER COLUMN "submissionDate" DROP DEFAULT`);
    }

}

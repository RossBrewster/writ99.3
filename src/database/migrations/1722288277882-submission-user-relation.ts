import { MigrationInterface, QueryRunner } from "typeorm";

export class SubmissionUserRelation1722288277882 implements MigrationInterface {
    name = 'SubmissionUserRelation1722288277882'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop existing foreign key constraints
        await queryRunner.query(`ALTER TABLE "student_submission" DROP CONSTRAINT IF EXISTS "FK_24ec4583b2e1337c4e53ce46473"`);
        await queryRunner.query(`ALTER TABLE "student_submission" DROP CONSTRAINT IF EXISTS "FK_0f9de20d251e7394818037d7c2f"`);

        // Delete rows with null assignmentId or studentId
        await queryRunner.query(`
            DELETE FROM "student_submission" 
            WHERE "assignmentId" IS NULL OR "studentId" IS NULL
        `);

        // Now we can safely set the columns to NOT NULL
        await queryRunner.query(`ALTER TABLE "student_submission" ALTER COLUMN "assignmentId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "student_submission" ALTER COLUMN "studentId" SET NOT NULL`);

        // Re-add the foreign key constraints
        await queryRunner.query(`ALTER TABLE "student_submission" ADD CONSTRAINT "FK_24ec4583b2e1337c4e53ce46473" FOREIGN KEY ("assignmentId") REFERENCES "assignment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "student_submission" ADD CONSTRAINT "FK_0f9de20d251e7394818037d7c2f" FOREIGN KEY ("studentId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the foreign key constraints
        await queryRunner.query(`ALTER TABLE "student_submission" DROP CONSTRAINT IF EXISTS "FK_0f9de20d251e7394818037d7c2f"`);
        await queryRunner.query(`ALTER TABLE "student_submission" DROP CONSTRAINT IF EXISTS "FK_24ec4583b2e1337c4e53ce46473"`);

        // Remove the NOT NULL constraints
        await queryRunner.query(`ALTER TABLE "student_submission" ALTER COLUMN "studentId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "student_submission" ALTER COLUMN "assignmentId" DROP NOT NULL`);

        // Re-add the foreign key constraints
        await queryRunner.query(`ALTER TABLE "student_submission" ADD CONSTRAINT "FK_0f9de20d251e7394818037d7c2f" FOREIGN KEY ("studentId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "student_submission" ADD CONSTRAINT "FK_24ec4583b2e1337c4e53ce46473" FOREIGN KEY ("assignmentId") REFERENCES "assignment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
}
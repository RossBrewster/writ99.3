import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1720814948166 implements MigrationInterface {
    name = 'InitialMigration1720814948166'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "rubric_version" ("id" SERIAL NOT NULL, "versionNumber" integer NOT NULL, "isActive" boolean NOT NULL, "createdDate" TIMESTAMP NOT NULL, "assignmentId" integer, "templateId" integer, CONSTRAINT "PK_b100e428ba9427c4b26f4ad2ba6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "rubric_template" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "createdDate" TIMESTAMP NOT NULL, "createdById" integer, CONSTRAINT "PK_ec4fd941ae8dd908994ac41dd64" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "criteria_example" ("id" SERIAL NOT NULL, "exampleText" text NOT NULL, "exampleScore" integer NOT NULL, "exampleFeedback" text NOT NULL, "criteriaId" integer, CONSTRAINT "PK_badda78d061db40fad3585b15a6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "rubric_criteria" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" text NOT NULL, "maxScore" integer NOT NULL, "templateId" integer, CONSTRAINT "PK_8bdb168f88489aa75202269f994" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "feedback" ("id" SERIAL NOT NULL, "aiFeedback" text NOT NULL, "teacherFeedback" text, "score" integer NOT NULL, "feedbackDate" TIMESTAMP NOT NULL, "submissionId" integer, "criteriaId" integer, "rubricVersionId" integer, CONSTRAINT "PK_8389f9e087a57689cd5be8b2b13" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "student_submission" ("id" SERIAL NOT NULL, "draftNumber" integer NOT NULL, "content" text NOT NULL, "submissionDate" TIMESTAMP NOT NULL, "assignmentId" integer, "studentId" integer, CONSTRAINT "PK_5a705fe6ea10958506bc39ae402" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "classroom" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying, "teacherId" integer, CONSTRAINT "PK_729f896c8b7b96ddf10c341e6ff" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "assignment" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" text NOT NULL, "instructions" text NOT NULL, "readingMaterial" text, "minimumDrafts" integer NOT NULL, "dueDate" TIMESTAMP NOT NULL, "createdById" integer, "classroomId" integer, CONSTRAINT "PK_43c2f5a3859f54cedafb270f37e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "username" character varying NOT NULL, "email" character varying NOT NULL, "passwordHash" character varying NOT NULL, "role" character varying NOT NULL, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "classroom_students_user" ("classroomId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_385da1b41bd838a855f563311fb" PRIMARY KEY ("classroomId", "userId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_cc62906ff83c3c2293beb2183e" ON "classroom_students_user" ("classroomId") `);
        await queryRunner.query(`CREATE INDEX "IDX_654c1fbf201be62aca4416f9fa" ON "classroom_students_user" ("userId") `);
        await queryRunner.query(`ALTER TABLE "rubric_version" ADD CONSTRAINT "FK_a68bc5bb27d9774337396b44932" FOREIGN KEY ("assignmentId") REFERENCES "assignment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "rubric_version" ADD CONSTRAINT "FK_4a147489c0c2ba2a838c36505c3" FOREIGN KEY ("templateId") REFERENCES "rubric_template"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "rubric_template" ADD CONSTRAINT "FK_7557f8ac7a9bbf90d284961f25b" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "criteria_example" ADD CONSTRAINT "FK_a8855a61028671d82f72035b304" FOREIGN KEY ("criteriaId") REFERENCES "rubric_criteria"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "rubric_criteria" ADD CONSTRAINT "FK_d65b849aff2d17d471ac2ffdd3d" FOREIGN KEY ("templateId") REFERENCES "rubric_template"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "feedback" ADD CONSTRAINT "FK_ae2f58b7d0fa9be21519af3d457" FOREIGN KEY ("submissionId") REFERENCES "student_submission"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "feedback" ADD CONSTRAINT "FK_d9365667c02b0346f10b902437a" FOREIGN KEY ("criteriaId") REFERENCES "rubric_criteria"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "feedback" ADD CONSTRAINT "FK_f7c22eaae513f93d2d02798dec7" FOREIGN KEY ("rubricVersionId") REFERENCES "rubric_version"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "student_submission" ADD CONSTRAINT "FK_24ec4583b2e1337c4e53ce46473" FOREIGN KEY ("assignmentId") REFERENCES "assignment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "student_submission" ADD CONSTRAINT "FK_0f9de20d251e7394818037d7c2f" FOREIGN KEY ("studentId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "classroom" ADD CONSTRAINT "FK_2b3c1fa62762d7d0e828c139130" FOREIGN KEY ("teacherId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "assignment" ADD CONSTRAINT "FK_07993adba7a9586aa4c752e8088" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "assignment" ADD CONSTRAINT "FK_3aa583ffb962fe9920957b0b1bb" FOREIGN KEY ("classroomId") REFERENCES "classroom"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "classroom_students_user" ADD CONSTRAINT "FK_cc62906ff83c3c2293beb2183e0" FOREIGN KEY ("classroomId") REFERENCES "classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "classroom_students_user" ADD CONSTRAINT "FK_654c1fbf201be62aca4416f9fa7" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "classroom_students_user" DROP CONSTRAINT "FK_654c1fbf201be62aca4416f9fa7"`);
        await queryRunner.query(`ALTER TABLE "classroom_students_user" DROP CONSTRAINT "FK_cc62906ff83c3c2293beb2183e0"`);
        await queryRunner.query(`ALTER TABLE "assignment" DROP CONSTRAINT "FK_3aa583ffb962fe9920957b0b1bb"`);
        await queryRunner.query(`ALTER TABLE "assignment" DROP CONSTRAINT "FK_07993adba7a9586aa4c752e8088"`);
        await queryRunner.query(`ALTER TABLE "classroom" DROP CONSTRAINT "FK_2b3c1fa62762d7d0e828c139130"`);
        await queryRunner.query(`ALTER TABLE "student_submission" DROP CONSTRAINT "FK_0f9de20d251e7394818037d7c2f"`);
        await queryRunner.query(`ALTER TABLE "student_submission" DROP CONSTRAINT "FK_24ec4583b2e1337c4e53ce46473"`);
        await queryRunner.query(`ALTER TABLE "feedback" DROP CONSTRAINT "FK_f7c22eaae513f93d2d02798dec7"`);
        await queryRunner.query(`ALTER TABLE "feedback" DROP CONSTRAINT "FK_d9365667c02b0346f10b902437a"`);
        await queryRunner.query(`ALTER TABLE "feedback" DROP CONSTRAINT "FK_ae2f58b7d0fa9be21519af3d457"`);
        await queryRunner.query(`ALTER TABLE "rubric_criteria" DROP CONSTRAINT "FK_d65b849aff2d17d471ac2ffdd3d"`);
        await queryRunner.query(`ALTER TABLE "criteria_example" DROP CONSTRAINT "FK_a8855a61028671d82f72035b304"`);
        await queryRunner.query(`ALTER TABLE "rubric_template" DROP CONSTRAINT "FK_7557f8ac7a9bbf90d284961f25b"`);
        await queryRunner.query(`ALTER TABLE "rubric_version" DROP CONSTRAINT "FK_4a147489c0c2ba2a838c36505c3"`);
        await queryRunner.query(`ALTER TABLE "rubric_version" DROP CONSTRAINT "FK_a68bc5bb27d9774337396b44932"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_654c1fbf201be62aca4416f9fa"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cc62906ff83c3c2293beb2183e"`);
        await queryRunner.query(`DROP TABLE "classroom_students_user"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "assignment"`);
        await queryRunner.query(`DROP TABLE "classroom"`);
        await queryRunner.query(`DROP TABLE "student_submission"`);
        await queryRunner.query(`DROP TABLE "feedback"`);
        await queryRunner.query(`DROP TABLE "rubric_criteria"`);
        await queryRunner.query(`DROP TABLE "criteria_example"`);
        await queryRunner.query(`DROP TABLE "rubric_template"`);
        await queryRunner.query(`DROP TABLE "rubric_version"`);
    }

}

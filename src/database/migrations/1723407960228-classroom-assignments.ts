import { MigrationInterface, QueryRunner } from "typeorm";

export class ClassroomAssignments1723407960228 implements MigrationInterface {
    name = 'ClassroomAssignments1723407960228'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "assignment" DROP CONSTRAINT "FK_3aa583ffb962fe9920957b0b1bb"`);
        await queryRunner.query(`CREATE TABLE "classroom_assignment" ("id" SERIAL NOT NULL, "dueDate" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "classroomId" integer, "assignmentId" integer, CONSTRAINT "PK_a6cec26e5617c992d4bdc76c69a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "assignment" DROP COLUMN "dueDate"`);
        await queryRunner.query(`ALTER TABLE "assignment" DROP COLUMN "classroomId"`);
        await queryRunner.query(`ALTER TABLE "assignment" ALTER COLUMN "prompt" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "classroom_assignment" ADD CONSTRAINT "FK_dc187fa77e1d57f1c9cc4e8809b" FOREIGN KEY ("classroomId") REFERENCES "classroom"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "classroom_assignment" ADD CONSTRAINT "FK_9c89562a3696d91a6e395a87cea" FOREIGN KEY ("assignmentId") REFERENCES "assignment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "classroom_assignment" DROP CONSTRAINT "FK_9c89562a3696d91a6e395a87cea"`);
        await queryRunner.query(`ALTER TABLE "classroom_assignment" DROP CONSTRAINT "FK_dc187fa77e1d57f1c9cc4e8809b"`);
        await queryRunner.query(`ALTER TABLE "assignment" ALTER COLUMN "prompt" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "assignment" ADD "classroomId" integer`);
        await queryRunner.query(`ALTER TABLE "assignment" ADD "dueDate" TIMESTAMP NOT NULL`);
        await queryRunner.query(`DROP TABLE "classroom_assignment"`);
        await queryRunner.query(`ALTER TABLE "assignment" ADD CONSTRAINT "FK_3aa583ffb962fe9920957b0b1bb" FOREIGN KEY ("classroomId") REFERENCES "classroom"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}

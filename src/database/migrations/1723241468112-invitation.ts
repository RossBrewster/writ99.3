import { MigrationInterface, QueryRunner } from "typeorm";

export class Invitation1723241468112 implements MigrationInterface {
    name = 'Invitation1723241468112'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "classroom" ADD "invitationCode" character varying(6)`);
        await queryRunner.query(`ALTER TABLE "classroom" ADD CONSTRAINT "UQ_42ab895e04be57536ba8820af6c" UNIQUE ("invitationCode")`);
        await queryRunner.query(`ALTER TABLE "classroom" ADD "invitationCodeExpiration" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "classroom" DROP COLUMN "invitationCodeExpiration"`);
        await queryRunner.query(`ALTER TABLE "classroom" DROP CONSTRAINT "UQ_42ab895e04be57536ba8820af6c"`);
        await queryRunner.query(`ALTER TABLE "classroom" DROP COLUMN "invitationCode"`);
    }

}

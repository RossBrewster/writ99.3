import { MigrationInterface, QueryRunner } from "typeorm";

export class TeacherToClassroom1723229861795 implements MigrationInterface {
    name = 'TeacherToClassroom1723229861795'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Ensure the teacherId column exists (in case it doesn't)
        await queryRunner.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (
                    SELECT FROM information_schema.columns 
                    WHERE table_name = 'classroom' AND column_name = 'teacherId'
                ) THEN 
                    ALTER TABLE "classroom" ADD COLUMN "teacherId" integer;
                END IF; 
            END $$;
        `);

        // Drop existing constraint if it exists
        await queryRunner.query(`
            ALTER TABLE "classroom" 
            DROP CONSTRAINT IF EXISTS "FK_2b3c1fa62762d7d0e828c139130"
        `);

        // Make teacherId NOT NULL
        await queryRunner.query(`
            ALTER TABLE "classroom" 
            ALTER COLUMN "teacherId" SET NOT NULL
        `);

        // Add foreign key constraint
        await queryRunner.query(`
            ALTER TABLE "classroom" 
            ADD CONSTRAINT "FK_2b3c1fa62762d7d0e828c139130" 
            FOREIGN KEY ("teacherId") 
            REFERENCES "user"("id") 
            ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the foreign key constraint
        await queryRunner.query(`
            ALTER TABLE "classroom" 
            DROP CONSTRAINT IF EXISTS "FK_2b3c1fa62762d7d0e828c139130"
        `);

        // Make teacherId nullable
        await queryRunner.query(`
            ALTER TABLE "classroom" 
            ALTER COLUMN "teacherId" DROP NOT NULL
        `);

        // Re-add the foreign key constraint without NOT NULL
        await queryRunner.query(`
            ALTER TABLE "classroom" 
            ADD CONSTRAINT "FK_2b3c1fa62762d7d0e828c139130" 
            FOREIGN KEY ("teacherId") 
            REFERENCES "user"("id") 
            ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }
}
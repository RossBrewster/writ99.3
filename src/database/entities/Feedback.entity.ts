import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { StudentSubmission } from "./StudentSubmission.entity";
import { RubricCriteria } from "./RubricCriteria.entity";
import { RubricVersion } from "./RubricVersion.entity";

@Entity()
export class Feedback {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => StudentSubmission, submission => submission.feedback)
    submission: StudentSubmission;

    @ManyToOne(() => RubricCriteria, criteria => criteria.feedback)
    criteria: RubricCriteria;

    @ManyToOne(() => RubricVersion, version => version.feedback)
    rubricVersion: RubricVersion;

    @Column("text")
    aiFeedback: string;

    @Column("text", { nullable: true })
    teacherFeedback: string;

    @Column()
    score: number;

    @Column()
    feedbackDate: Date;
}
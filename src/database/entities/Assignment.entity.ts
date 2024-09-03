import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { User } from "./User.entity";
import { StudentSubmission } from "./StudentSubmission.entity";
import { RubricVersion } from "./RubricVersion.entity";
import { ClassroomAssignment } from "./ClassroomAssignment.entity";

@Entity()
export class Assignment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    prompt: string;

    @Column("text")
    description: string;

    @Column("text")
    instructions: string;

    @Column("text", { nullable: true })
    readingMaterial: string;

    @Column()
    minimumDrafts: number;

    @Column()
    createdById: number;

    @ManyToOne(() => User, user => user.createdAssignments)
    createdBy: User;

    @OneToMany(() => ClassroomAssignment, classroomAssignment => classroomAssignment.assignment)
    classroomAssignments: ClassroomAssignment[];

    @OneToMany(() => StudentSubmission, submission => submission.assignment)
    submissions: StudentSubmission[];

    @OneToMany(() => RubricVersion, rubricVersion => rubricVersion.assignment)
    rubricVersions: RubricVersion[];
}
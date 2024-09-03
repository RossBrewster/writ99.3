import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { Assignment } from "./Assignment.entity";
import { RubricTemplate } from "./RubricTemplate.entity";
import { Feedback } from "./Feedback.entity";

@Entity()
export class RubricVersion {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Assignment, assignment => assignment.rubricVersions)
    assignment: Assignment;

    @ManyToOne(() => RubricTemplate, template => template.versions)
    template: RubricTemplate;

    @Column()
    versionNumber: number;

    @Column()
    isActive: boolean;

    @Column()
    createdDate: Date;

    @OneToMany(() => Feedback, feedback => feedback.rubricVersion)
    feedback: Feedback[];
}
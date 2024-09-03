import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { RubricTemplate } from "./RubricTemplate.entity";
import { CriteriaExample } from "./CriteriaExample.entity";
import { Feedback } from "./Feedback.entity";

@Entity()
export class RubricCriteria {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column("text")
    description: string;

    @Column()
    maxScore: number;

    @ManyToOne(() => RubricTemplate, template => template.criteria)
    template: RubricTemplate;

    @OneToMany(() => CriteriaExample, example => example.criteria)
    examples: CriteriaExample[];

    @OneToMany(() => Feedback, feedback => feedback.criteria)
    feedback: Feedback[];
}
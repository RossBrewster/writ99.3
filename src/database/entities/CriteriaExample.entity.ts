import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { RubricCriteria } from "./RubricCriteria.entity";

@Entity()
export class CriteriaExample {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => RubricCriteria, criteria => criteria.examples)
    criteria: RubricCriteria;

    @Column("text")
    exampleText: string;

    @Column()
    exampleScore: number;

    @Column("text")
    exampleFeedback: string;
}
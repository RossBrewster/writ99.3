import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Classroom } from "./Classroom.entity";
import { Assignment } from "./Assignment.entity";

@Entity()
export class ClassroomAssignment {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Classroom, classroom => classroom.classroomAssignments)
    classroom: Classroom;

    @ManyToOne(() => Assignment, assignment => assignment.classroomAssignments)
    assignment: Assignment;

    @Column()
    dueDate: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
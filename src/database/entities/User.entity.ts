import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany } from "typeorm";
import { Assignment } from "./Assignment.entity";
import { Classroom } from "./Classroom.entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column()
    email: string;

    @Column()
    passwordHash: string;

    @Column()
    role: 'student' | 'teacher' | 'admin';

    @OneToMany(() => Assignment, assignment => assignment.createdBy)
    createdAssignments: Assignment[];

    @OneToMany(() => Classroom, classroom => classroom.teacher)
    taughtClassrooms: Classroom[];

    @ManyToMany(() => Classroom, classroom => classroom.students)
    enrolledClassrooms: Classroom[];
}
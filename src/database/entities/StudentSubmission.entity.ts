import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from "typeorm";
import { Assignment } from "./Assignment.entity";
import { User } from "./User.entity";
import { Feedback } from "./Feedback.entity";

@Entity()
export class StudentSubmission {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Assignment, assignment => assignment.submissions, { nullable: false })
    assignment: Assignment;

    @Column({ nullable: false })
    assignmentId: number;

    @ManyToOne(() => User)
    student: User;

    @Column()
    studentId: number;

    @Column()
    draftNumber: number;

    @Column("text")
    content: string;

    @CreateDateColumn()
    submissionDate: Date;

    @OneToMany(() => Feedback, feedback => feedback.submission)
    feedback: Feedback[];
}
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable, OneToMany } from "typeorm";
import { User } from "./User.entity";
import { ClassroomAssignment } from "./ClassroomAssignment.entity";

@Entity()
export class Classroom {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ nullable: true })
    description: string;

    @Column()
    teacherId: number;

    @Column({ length: 6, unique: true, nullable: true })
    invitationCode: string;

    @Column({ nullable: true })
    invitationCodeExpiration: Date;

    @ManyToOne(() => User, user => user.taughtClassrooms)
    teacher: User;

    @ManyToMany(() => User, user => user.enrolledClassrooms)
    @JoinTable()
    students: User[];

    @OneToMany(() => ClassroomAssignment, classroomAssignment => classroomAssignment.classroom)
    classroomAssignments: ClassroomAssignment[];
}

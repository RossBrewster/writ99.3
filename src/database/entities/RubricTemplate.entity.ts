import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { User } from "./User.entity";
import { RubricCriteria } from "./RubricCriteria.entity";
import { RubricVersion } from "./RubricVersion.entity";

@Entity()
export class RubricTemplate {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    createdDate: Date;

    @ManyToOne(() => User)
    createdBy: User;

    @OneToMany(() => RubricCriteria, criteria => criteria.template)
    criteria: RubricCriteria[];

    @OneToMany(() => RubricVersion, version => version.template)
    versions: RubricVersion[];
}
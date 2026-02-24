import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    keycloakId: string;

    @Column()
    email: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ nullable: true })
    avatarUrl: string;

    @Column({ type: 'simple-array', nullable: true })
    interests: string[];

    @Column({ default: true })
    notifyNewArticle: boolean;

    @Column({ default: true })
    notifyPriceChange: boolean;

    @Column({ default: false })
    notifyByEmail: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

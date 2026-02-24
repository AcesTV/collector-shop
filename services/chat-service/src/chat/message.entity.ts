import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('messages')
export class Message {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    conversationId: string;

    @Column()
    senderId: string;

    @Column({ type: 'text' })
    content: string;

    @Column({ default: false })
    isRead: boolean;

    @Column({ default: false })
    isModerated: boolean;

    @CreateDateColumn()
    createdAt: Date;
}

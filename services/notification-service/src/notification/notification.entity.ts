import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum NotificationType {
    NEW_ARTICLE = 'new_article',
    PRICE_CHANGE = 'price_change',
    ORDER_UPDATE = 'order_update',
    MESSAGE = 'message',
    SYSTEM = 'system',
}

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @Column({ type: 'enum', enum: NotificationType })
    type: NotificationType;

    @Column()
    title: string;

    @Column({ type: 'text' })
    message: string;

    @Column({ default: false })
    isRead: boolean;

    @Column({ default: false })
    emailSent: boolean;

    @Column({ nullable: true })
    referenceId: string;  // Product ID, Order ID, etc.

    @CreateDateColumn()
    createdAt: Date;
}

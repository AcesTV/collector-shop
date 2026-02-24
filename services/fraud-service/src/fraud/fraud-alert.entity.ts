import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum AlertSeverity {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical',
}

export enum AlertType {
    PRICE_ANOMALY = 'price_anomaly',
    SUSPECT_VENDOR = 'suspect_vendor',
    RAPID_PRICE_CHANGE = 'rapid_price_change',
    UNUSUAL_ACTIVITY = 'unusual_activity',
}

@Entity('fraud_alerts')
export class FraudAlert {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'enum', enum: AlertType })
    type: AlertType;

    @Column({ type: 'enum', enum: AlertSeverity })
    severity: AlertSeverity;

    @Column({ nullable: true })
    productId: string;

    @Column({ nullable: true })
    sellerId: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'jsonb', nullable: true })
    details: Record<string, any>;

    @Column({ default: false })
    isResolved: boolean;

    @Column({ nullable: true })
    resolvedBy: string;

    @CreateDateColumn()
    createdAt: Date;
}

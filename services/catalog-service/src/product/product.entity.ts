import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
    ManyToOne, JoinColumn,
} from 'typeorm';
import { Category } from '../category/category.entity';
import { Shop } from '../shop/shop.entity';

export enum ProductStatus {
    PENDING = 'pending',       // En attente de modération
    APPROVED = 'approved',     // Validé
    REJECTED = 'rejected',     // Rejeté
    SOLD = 'sold',             // Vendu
}

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    shippingCost: number;

    @Column({ type: 'simple-array', nullable: true })
    imageUrls: string[];

    @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.PENDING })
    status: ProductStatus;

    @Column()
    sellerId: string;  // Keycloak user ID

    @ManyToOne(() => Category, { eager: true })
    @JoinColumn()
    category: Category;

    @Column({ nullable: true })
    categoryId: string;

    @ManyToOne(() => Shop, { eager: true, nullable: true })
    @JoinColumn()
    shop: Shop;

    @Column({ nullable: true })
    shopId: string;

    @Column({ nullable: true })
    condition: string;  // neuf, bon état, usagé...

    @Column({ type: 'jsonb', nullable: true })
    priceHistory: { price: number; date: Date }[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

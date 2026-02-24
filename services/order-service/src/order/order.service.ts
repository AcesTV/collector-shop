import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './order.entity';
import { OrderItem } from './order-item.entity';
import { CommissionService } from './commission.service';

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepo: Repository<Order>,
        @InjectRepository(OrderItem)
        private readonly orderItemRepo: Repository<OrderItem>,
        private readonly commissionService: CommissionService,
    ) { }

    async create(buyerId: string, items: { productId: string; productTitle: string; price: number; shippingCost: number; sellerId: string }[]): Promise<Order> {
        const subtotal = items.reduce((sum, item) => sum + item.price + item.shippingCost, 0);
        const { commission, total } = this.commissionService.calculate(subtotal);

        const order = this.orderRepo.create({
            buyerId,
            sellerId: items[0].sellerId,
            subtotal,
            commission,
            total,
            status: OrderStatus.PENDING,
            items: items.map((item) =>
                this.orderItemRepo.create({
                    productId: item.productId,
                    productTitle: item.productTitle,
                    price: item.price,
                    shippingCost: item.shippingCost,
                }),
            ),
        });

        return this.orderRepo.save(order);
    }

    async findByBuyer(buyerId: string): Promise<Order[]> {
        return this.orderRepo.find({ where: { buyerId }, order: { createdAt: 'DESC' } });
    }

    async findBySeller(sellerId: string): Promise<Order[]> {
        return this.orderRepo.find({ where: { sellerId }, order: { createdAt: 'DESC' } });
    }

    async findById(id: string): Promise<Order> {
        const order = await this.orderRepo.findOne({ where: { id } });
        if (!order) throw new NotFoundException('Order not found');
        return order;
    }

    async updateStatus(id: string, status: OrderStatus): Promise<Order> {
        const order = await this.findById(id);
        order.status = status;
        return this.orderRepo.save(order);
    }

    async rateSeller(orderId: string, buyerId: string, rating: number): Promise<Order> {
        const order = await this.findById(orderId);
        if (order.buyerId !== buyerId) throw new ForbiddenException('Not your order');
        order.sellerRating = rating;
        return this.orderRepo.save(order);
    }

    async rateBuyer(orderId: string, sellerId: string, rating: number): Promise<Order> {
        const order = await this.findById(orderId);
        if (order.sellerId !== sellerId) throw new ForbiddenException('Not your order');
        order.buyerRating = rating;
        return this.orderRepo.save(order);
    }
}

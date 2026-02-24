import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shop } from './shop.entity';

@Injectable()
export class ShopService {
    constructor(
        @InjectRepository(Shop)
        private readonly shopRepo: Repository<Shop>,
    ) { }

    async create(sellerId: string, name: string, description?: string): Promise<Shop> {
        const shop = this.shopRepo.create({ sellerId, name, description });
        return this.shopRepo.save(shop);
    }

    async findBySeller(sellerId: string): Promise<Shop[]> {
        return this.shopRepo.find({ where: { sellerId } });
    }

    async findById(id: string): Promise<Shop> {
        const shop = await this.shopRepo.findOne({ where: { id } });
        if (!shop) throw new NotFoundException('Shop not found');
        return shop;
    }

    async update(id: string, sellerId: string, data: Partial<Shop>): Promise<Shop> {
        const shop = await this.findById(id);
        if (shop.sellerId !== sellerId) throw new ForbiddenException('Not your shop');
        Object.assign(shop, data);
        return this.shopRepo.save(shop);
    }

    async delete(id: string, sellerId: string): Promise<void> {
        const shop = await this.findById(id);
        if (shop.sellerId !== sellerId) throw new ForbiddenException('Not your shop');
        await this.shopRepo.remove(shop);
    }
}

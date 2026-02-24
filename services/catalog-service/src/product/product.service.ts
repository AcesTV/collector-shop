import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductStatus } from './product.entity';
import { CreateProductDto, UpdateProductDto } from './dto';
import { ContentFilterService } from '../content-filter/content-filter.service';

@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(Product)
        private readonly productRepo: Repository<Product>,
        private readonly contentFilter: ContentFilterService,
    ) { }

    async create(sellerId: string, dto: CreateProductDto): Promise<Product> {
        // Filtrage des informations personnelles
        this.contentFilter.validateContent(dto.title, 'titre');
        this.contentFilter.validateContent(dto.description, 'description');

        const product = this.productRepo.create({
            ...dto,
            sellerId,
            status: ProductStatus.PENDING,
            priceHistory: [{ price: dto.price, date: new Date() }],
        });

        return this.productRepo.save(product);
    }

    async findAll(filters?: {
        categoryId?: string;
        status?: ProductStatus;
        sellerId?: string;
        search?: string;
    }): Promise<Product[]> {
        const qb = this.productRepo.createQueryBuilder('product')
            .leftJoinAndSelect('product.category', 'category')
            .leftJoinAndSelect('product.shop', 'shop');

        if (filters?.categoryId) {
            qb.andWhere('product.categoryId = :categoryId', { categoryId: filters.categoryId });
        }
        if (filters?.status) {
            qb.andWhere('product.status = :status', { status: filters.status });
        } else {
            // By default, only show approved products for public listing
            qb.andWhere('product.status = :status', { status: ProductStatus.APPROVED });
        }
        if (filters?.sellerId) {
            qb.andWhere('product.sellerId = :sellerId', { sellerId: filters.sellerId });
        }
        if (filters?.search) {
            qb.andWhere('(product.title ILIKE :search OR product.description ILIKE :search)', {
                search: `%${filters.search}%`,
            });
        }

        qb.orderBy('product.createdAt', 'DESC');
        return qb.getMany();
    }

    async findById(id: string): Promise<Product> {
        const product = await this.productRepo.findOne({
            where: { id },
            relations: ['category', 'shop'],
        });
        if (!product) throw new NotFoundException('Product not found');
        return product;
    }

    async update(id: string, sellerId: string, dto: UpdateProductDto): Promise<Product> {
        const product = await this.findById(id);
        if (product.sellerId !== sellerId) {
            throw new ForbiddenException('You can only update your own products');
        }

        if (dto.description) {
            this.contentFilter.validateContent(dto.description, 'description');
        }
        if (dto.title) {
            this.contentFilter.validateContent(dto.title, 'titre');
        }

        // Track price changes
        if (dto.price && dto.price !== product.price) {
            const history = product.priceHistory || [];
            history.push({ price: dto.price, date: new Date() });
            product.priceHistory = history;
        }

        Object.assign(product, dto);
        // Re-submit for moderation after edit
        product.status = ProductStatus.PENDING;

        return this.productRepo.save(product);
    }

    async updateStatus(id: string, status: ProductStatus): Promise<Product> {
        const product = await this.findById(id);
        product.status = status;
        return this.productRepo.save(product);
    }

    async delete(id: string, sellerId: string): Promise<void> {
        const product = await this.findById(id);
        if (product.sellerId !== sellerId) {
            throw new ForbiddenException('You can only delete your own products');
        }
        await this.productRepo.remove(product);
    }

    async findPending(): Promise<Product[]> {
        return this.productRepo.find({
            where: { status: ProductStatus.PENDING },
            order: { createdAt: 'ASC' },
        });
    }
}

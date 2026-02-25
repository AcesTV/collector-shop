import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ProductService } from './product.service';
import { Product, ProductStatus } from './product.entity';
import { ContentFilterService } from '../content-filter/content-filter.service';

// ── Helpers ────────────────────────────────────────────────
const mockProduct = (overrides: Partial<Product> = {}): Product => ({
    id: 'prod-1',
    title: 'Figurine Star Wars',
    description: 'Figurine originale 1977',
    price: 150,
    shippingCost: 5,
    imageUrls: ['https://cdn.example.com/fig.jpg'],
    status: ProductStatus.PENDING,
    sellerId: 'seller-abc',
    category: null as any,
    categoryId: 'cat-1',
    shop: null as any,
    shopId: null as any,
    condition: 'bon état',
    priceHistory: [{ price: 150, date: new Date('2025-01-01') }],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
});

const createMockRepository = () => ({
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
});

// ── Test Suite ─────────────────────────────────────────────
describe('ProductService', () => {
    let service: ProductService;
    let repo: ReturnType<typeof createMockRepository>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProductService,
                ContentFilterService,
                {
                    provide: getRepositoryToken(Product),
                    useFactory: createMockRepository,
                },
            ],
        }).compile();

        service = module.get<ProductService>(ProductService);
        repo = module.get(getRepositoryToken(Product));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    // ── create() ───────────────────────────────────────────
    describe('create()', () => {
        const dto = {
            title: 'Poster Rocky',
            description: 'Poster dédicacé en excellent état',
            price: 200,
            categoryId: 'cat-1',
        };

        it('should create a product with PENDING status', async () => {
            const created = mockProduct({ ...dto, status: ProductStatus.PENDING });
            repo.create.mockReturnValue(created);
            repo.save.mockResolvedValue(created);

            const result = await service.create('seller-abc', dto);

            expect(repo.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    ...dto,
                    sellerId: 'seller-abc',
                    status: ProductStatus.PENDING,
                }),
            );
            expect(repo.save).toHaveBeenCalledWith(created);
            expect(result.status).toBe(ProductStatus.PENDING);
        });

        it('should initialize priceHistory with the initial price', async () => {
            const created = mockProduct(dto);
            repo.create.mockReturnValue(created);
            repo.save.mockResolvedValue(created);

            await service.create('seller-abc', dto);

            expect(repo.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    priceHistory: expect.arrayContaining([
                        expect.objectContaining({ price: 200 }),
                    ]),
                }),
            );
        });

        it('should reject description containing personal email', async () => {
            const badDto = { ...dto, description: 'Contactez-moi à test@gmail.com' };

            await expect(service.create('seller-abc', badDto)).rejects.toThrow(
                BadRequestException,
            );
        });

        it('should reject title containing a phone number', async () => {
            const badDto = { ...dto, title: 'Appel 06 12 34 56 78' };

            await expect(service.create('seller-abc', badDto)).rejects.toThrow(
                BadRequestException,
            );
        });
    });

    // ── findAll() ──────────────────────────────────────────
    describe('findAll()', () => {
        let qb: Record<string, jest.Mock>;

        beforeEach(() => {
            qb = {
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                getMany: jest.fn().mockResolvedValue([mockProduct()]),
            };
            repo.createQueryBuilder.mockReturnValue(qb);
        });

        it('should default to APPROVED status when no status filter provided', async () => {
            await service.findAll({});

            expect(qb.andWhere).toHaveBeenCalledWith(
                'product.status = :status',
                { status: ProductStatus.APPROVED },
            );
        });

        it('should filter by categoryId when provided', async () => {
            await service.findAll({ categoryId: 'cat-42' });

            expect(qb.andWhere).toHaveBeenCalledWith(
                'product.categoryId = :categoryId',
                { categoryId: 'cat-42' },
            );
        });

        it('should filter by search term with ILIKE', async () => {
            await service.findAll({ search: 'star wars' });

            expect(qb.andWhere).toHaveBeenCalledWith(
                '(product.title ILIKE :search OR product.description ILIKE :search)',
                { search: '%star wars%' },
            );
        });

        it('should order results by createdAt DESC', async () => {
            await service.findAll({});

            expect(qb.orderBy).toHaveBeenCalledWith('product.createdAt', 'DESC');
        });
    });

    // ── findById() ─────────────────────────────────────────
    describe('findById()', () => {
        it('should return a product if found', async () => {
            const product = mockProduct();
            repo.findOne.mockResolvedValue(product);

            const result = await service.findById('prod-1');

            expect(result).toEqual(product);
        });

        it('should throw NotFoundException if product does not exist', async () => {
            repo.findOne.mockResolvedValue(null);

            await expect(service.findById('unknown')).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    // ── update() ───────────────────────────────────────────
    describe('update()', () => {
        it('should update the product and reset status to PENDING', async () => {
            const existing = mockProduct({ status: ProductStatus.APPROVED });
            repo.findOne.mockResolvedValue(existing);
            repo.save.mockImplementation((p) => Promise.resolve(p));

            const result = await service.update('prod-1', 'seller-abc', {
                title: 'Figurine Star Wars Updated',
            });

            expect(result.status).toBe(ProductStatus.PENDING);
        });

        it('should throw ForbiddenException if seller does not own the product', async () => {
            const existing = mockProduct({ sellerId: 'other-seller' });
            repo.findOne.mockResolvedValue(existing);

            await expect(
                service.update('prod-1', 'seller-abc', { title: 'hack' }),
            ).rejects.toThrow(ForbiddenException);
        });

        it('should track price changes in priceHistory', async () => {
            const existing = mockProduct({
                price: 100,
                priceHistory: [{ price: 100, date: new Date() }],
            });
            repo.findOne.mockResolvedValue(existing);
            repo.save.mockImplementation((p) => Promise.resolve(p));

            const result = await service.update('prod-1', 'seller-abc', { price: 120 });

            expect(result.priceHistory).toHaveLength(2);
            expect(result.priceHistory![1].price).toBe(120);
        });

        it('should reject update with personal info in description', async () => {
            const existing = mockProduct();
            repo.findOne.mockResolvedValue(existing);

            await expect(
                service.update('prod-1', 'seller-abc', {
                    description: 'Envoyez un mail à vente@hotmail.fr',
                }),
            ).rejects.toThrow(BadRequestException);
        });
    });

    // ── updateStatus() ─────────────────────────────────────
    describe('updateStatus()', () => {
        it('should update the product status (admin moderation)', async () => {
            const existing = mockProduct({ status: ProductStatus.PENDING });
            repo.findOne.mockResolvedValue(existing);
            repo.save.mockImplementation((p) => Promise.resolve(p));

            const result = await service.updateStatus('prod-1', ProductStatus.APPROVED);

            expect(result.status).toBe(ProductStatus.APPROVED);
        });
    });

    // ── delete() ───────────────────────────────────────────
    describe('delete()', () => {
        it('should delete the product if the seller owns it', async () => {
            const existing = mockProduct({ sellerId: 'seller-abc' });
            repo.findOne.mockResolvedValue(existing);
            repo.remove.mockResolvedValue(undefined);

            await service.delete('prod-1', 'seller-abc');

            expect(repo.remove).toHaveBeenCalledWith(existing);
        });

        it('should throw ForbiddenException if deleting another seller product', async () => {
            const existing = mockProduct({ sellerId: 'other-seller' });
            repo.findOne.mockResolvedValue(existing);

            await expect(service.delete('prod-1', 'seller-abc')).rejects.toThrow(
                ForbiddenException,
            );
        });
    });

    // ── findPending() ──────────────────────────────────────
    describe('findPending()', () => {
        it('should return only PENDING products ordered by createdAt ASC', async () => {
            const pending = [mockProduct({ status: ProductStatus.PENDING })];
            repo.find.mockResolvedValue(pending);

            const result = await service.findPending();

            expect(repo.find).toHaveBeenCalledWith({
                where: { status: ProductStatus.PENDING },
                order: { createdAt: 'ASC' },
            });
            expect(result).toEqual(pending);
        });
    });
});

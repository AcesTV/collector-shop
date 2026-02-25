import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ShopService } from './shop.service';
import { Shop } from './shop.entity';

// ── Helpers ────────────────────────────────────────────────
const mockShop = (overrides: Partial<Shop> = {}): Shop => ({
    id: 'shop-1',
    name: 'Boutique Vintage',
    description: 'Objets rares des années 80',
    sellerId: 'seller-abc',
    avatarUrl: null as any,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
});

const createMockRepository = () => ({
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
});

// ── Test Suite ─────────────────────────────────────────────
describe('ShopService', () => {
    let service: ShopService;
    let repo: ReturnType<typeof createMockRepository>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ShopService,
                {
                    provide: getRepositoryToken(Shop),
                    useFactory: createMockRepository,
                },
            ],
        }).compile();

        service = module.get<ShopService>(ShopService);
        repo = module.get(getRepositoryToken(Shop));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    // ── create() ───────────────────────────────────────────
    describe('create()', () => {
        it('should create a shop for the seller', async () => {
            const shop = mockShop();
            repo.create.mockReturnValue(shop);
            repo.save.mockResolvedValue(shop);

            const result = await service.create('seller-abc', 'Boutique Vintage', 'Objets rares');

            expect(repo.create).toHaveBeenCalledWith({
                sellerId: 'seller-abc',
                name: 'Boutique Vintage',
                description: 'Objets rares',
            });
            expect(result).toEqual(shop);
        });
    });

    // ── findBySeller() ─────────────────────────────────────
    describe('findBySeller()', () => {
        it('should return all shops for a given seller', async () => {
            const shops = [mockShop(), mockShop({ id: 'shop-2', name: 'Autre Boutique' })];
            repo.find.mockResolvedValue(shops);

            const result = await service.findBySeller('seller-abc');

            expect(repo.find).toHaveBeenCalledWith({ where: { sellerId: 'seller-abc' } });
            expect(result).toHaveLength(2);
        });

        it('should return empty array if seller has no shops', async () => {
            repo.find.mockResolvedValue([]);

            const result = await service.findBySeller('seller-unknown');

            expect(result).toEqual([]);
        });
    });

    // ── findById() ─────────────────────────────────────────
    describe('findById()', () => {
        it('should return the shop when found', async () => {
            const shop = mockShop();
            repo.findOne.mockResolvedValue(shop);

            const result = await service.findById('shop-1');

            expect(result).toEqual(shop);
        });

        it('should throw NotFoundException when shop does not exist', async () => {
            repo.findOne.mockResolvedValue(null);

            await expect(service.findById('unknown')).rejects.toThrow(NotFoundException);
        });
    });

    // ── update() ───────────────────────────────────────────
    describe('update()', () => {
        it('should update the shop when the seller owns it', async () => {
            const existing = mockShop();
            repo.findOne.mockResolvedValue(existing);
            repo.save.mockImplementation((s) => Promise.resolve(s));

            const result = await service.update('shop-1', 'seller-abc', {
                name: 'Boutique Renommée',
            });

            expect(result.name).toBe('Boutique Renommée');
        });

        it('should throw ForbiddenException if the seller does not own the shop', async () => {
            const existing = mockShop({ sellerId: 'other-seller' });
            repo.findOne.mockResolvedValue(existing);

            await expect(
                service.update('shop-1', 'seller-abc', { name: 'hack' }),
            ).rejects.toThrow(ForbiddenException);
        });

        it('should throw NotFoundException if the shop does not exist', async () => {
            repo.findOne.mockResolvedValue(null);

            await expect(
                service.update('unknown', 'seller-abc', { name: 'x' }),
            ).rejects.toThrow(NotFoundException);
        });
    });

    // ── delete() ───────────────────────────────────────────
    describe('delete()', () => {
        it('should delete the shop when the seller owns it', async () => {
            const existing = mockShop();
            repo.findOne.mockResolvedValue(existing);
            repo.remove.mockResolvedValue(undefined);

            await service.delete('shop-1', 'seller-abc');

            expect(repo.remove).toHaveBeenCalledWith(existing);
        });

        it('should throw ForbiddenException if deleting another seller shop', async () => {
            const existing = mockShop({ sellerId: 'other-seller' });
            repo.findOne.mockResolvedValue(existing);

            await expect(
                service.delete('shop-1', 'seller-abc'),
            ).rejects.toThrow(ForbiddenException);
        });
    });
});

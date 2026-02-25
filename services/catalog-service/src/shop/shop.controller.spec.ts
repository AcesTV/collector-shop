import { Test, TestingModule } from '@nestjs/testing';
import { ShopController } from './shop.controller';
import { ShopService } from './shop.service';

const mockShopService = {
    findById: jest.fn(),
    findBySeller: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
};

const mockReq = { user: { userId: 'seller-1' } };

describe('ShopController', () => {
    let controller: ShopController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ShopController],
            providers: [{ provide: ShopService, useValue: mockShopService }],
        }).compile();
        controller = module.get<ShopController>(ShopController);
        jest.clearAllMocks();
    });

    it('should be defined', () => { expect(controller).toBeDefined(); });

    describe('findOne', () => {
        it('should return a shop by id', async () => {
            mockShopService.findById.mockResolvedValue('shop');
            const res = await controller.findOne('s-1');
            expect(mockShopService.findById).toHaveBeenCalledWith('s-1');
            expect(res).toBe('shop');
        });
    });

    describe('findMine', () => {
        it('should return seller shops', async () => {
            mockShopService.findBySeller.mockResolvedValue(['shop']);
            const res = await controller.findMine(mockReq);
            expect(mockShopService.findBySeller).toHaveBeenCalledWith('seller-1');
        });
    });

    describe('create', () => {
        it('should create a shop', async () => {
            mockShopService.create.mockResolvedValue('shop');
            const res = await controller.create(mockReq, { name: 'My Shop', description: 'Desc' });
            expect(mockShopService.create).toHaveBeenCalledWith('seller-1', 'My Shop', 'Desc');
        });
    });

    describe('update', () => {
        it('should update a shop', async () => {
            mockShopService.update.mockResolvedValue('shop');
            const res = await controller.update(mockReq, 's-1', { name: 'New' });
            expect(mockShopService.update).toHaveBeenCalledWith('s-1', 'seller-1', { name: 'New' });
        });
    });

    describe('delete', () => {
        it('should delete a shop', async () => {
            mockShopService.delete.mockResolvedValue(undefined);
            await controller.delete(mockReq, 's-1');
            expect(mockShopService.delete).toHaveBeenCalledWith('s-1', 'seller-1');
        });
    });
});

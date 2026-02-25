import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductStatus } from './product.entity';

const mockProductService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    updateStatus: jest.fn(),
    findPending: jest.fn(),
};

const mockReq = { user: { userId: 'seller-1' } };

describe('ProductController', () => {
    let controller: ProductController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ProductController],
            providers: [{ provide: ProductService, useValue: mockProductService }],
        }).compile();
        controller = module.get<ProductController>(ProductController);
        jest.clearAllMocks();
    });

    it('should be defined', () => { expect(controller).toBeDefined(); });

    describe('findAll', () => {
        it('should return approved products', async () => {
            mockProductService.findAll.mockResolvedValue(['p1']);
            const res = await controller.findAll(undefined, undefined);
            expect(mockProductService.findAll).toHaveBeenCalledWith({ categoryId: undefined, search: undefined, status: ProductStatus.APPROVED });
            expect(res).toEqual(['p1']);
        });
    });

    describe('findMine', () => {
        it('should return seller products', async () => {
            mockProductService.findAll.mockResolvedValue(['p1']);
            const res = await controller.findMine(mockReq);
            expect(mockProductService.findAll).toHaveBeenCalledWith({ sellerId: 'seller-1' });
        });
    });

    describe('findPending', () => {
        it('should return pending products', async () => {
            mockProductService.findPending.mockResolvedValue(['p1']);
            const res = await controller.findPending();
            expect(mockProductService.findPending).toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        it('should return one product', async () => {
            mockProductService.findById.mockResolvedValue('p1');
            const res = await controller.findOne('id-1');
            expect(mockProductService.findById).toHaveBeenCalledWith('id-1');
        });
    });

    describe('create', () => {
        it('should create a product', async () => {
            mockProductService.create.mockResolvedValue('p1');
            const dto = { title: 'T', description: 'D', price: 10, categoryId: 'c1' } as any;
            const res = await controller.create(mockReq, dto);
            expect(mockProductService.create).toHaveBeenCalledWith('seller-1', dto);
        });
    });

    describe('update', () => {
        it('should update a product', async () => {
            mockProductService.update.mockResolvedValue('p1');
            const dto = { title: 'New' } as any;
            const res = await controller.update(mockReq, 'id-1', dto);
            expect(mockProductService.update).toHaveBeenCalledWith('id-1', 'seller-1', dto);
        });
    });

    describe('delete', () => {
        it('should delete a product', async () => {
            mockProductService.delete.mockResolvedValue(undefined);
            await controller.delete(mockReq, 'id-1');
            expect(mockProductService.delete).toHaveBeenCalledWith('id-1', 'seller-1');
        });
    });

    describe('updateStatus', () => {
        it('should update product status', async () => {
            mockProductService.updateStatus.mockResolvedValue('p1');
            const res = await controller.updateStatus('id-1', { status: 'approved' } as any);
            expect(mockProductService.updateStatus).toHaveBeenCalledWith('id-1', 'approved');
        });
    });
});

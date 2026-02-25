import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { OrderService } from './order.service';
import { Order, OrderStatus } from './order.entity';
import { OrderItem } from './order-item.entity';
import { CommissionService } from './commission.service';

const mockOrder = {
    id: 'o-123',
    buyerId: 'buyer-1',
    sellerId: 'seller-1',
    subtotal: 100,
    commission: 5,
    total: 105,
    status: OrderStatus.PENDING,
    items: [],
    buyerRating: null,
    sellerRating: null,
    createdAt: new Date(),
    updatedAt: new Date(),
};

const mockOrderRepo = {
    create: jest.fn().mockReturnValue(mockOrder),
    save: jest.fn().mockResolvedValue(mockOrder),
    find: jest.fn().mockResolvedValue([mockOrder]),
    findOne: jest.fn().mockResolvedValue(mockOrder),
};

const mockOrderItemRepo = {
    create: jest.fn(),
};

const mockCommissionService = {
    calculate: jest.fn().mockReturnValue({ commission: 5, total: 105 }),
};

describe('OrderService', () => {
    let service: OrderService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OrderService,
                { provide: getRepositoryToken(Order), useValue: mockOrderRepo },
                { provide: getRepositoryToken(OrderItem), useValue: mockOrderItemRepo },
                { provide: CommissionService, useValue: mockCommissionService },
            ],
        }).compile();

        service = module.get<OrderService>(OrderService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create an order', async () => {
            const items = [{ productId: 'p-1', productTitle: 'Item 1', price: 90, shippingCost: 10, sellerId: 'seller-1' }];
            const result = await service.create('buyer-1', items);
            expect(mockCommissionService.calculate).toHaveBeenCalledWith(100);
            expect(mockOrderRepo.create).toHaveBeenCalled();
            expect(mockOrderRepo.save).toHaveBeenCalled();
            expect(result).toEqual(mockOrder);
        });
    });

    describe('findByBuyer', () => {
        it('should return orders by buyer', async () => {
            const result = await service.findByBuyer('buyer-1');
            expect(mockOrderRepo.find).toHaveBeenCalledWith({ where: { buyerId: 'buyer-1' }, order: { createdAt: 'DESC' } });
            expect(result).toHaveLength(1);
        });
    });

    describe('findBySeller', () => {
        it('should return orders by seller', async () => {
            const result = await service.findBySeller('seller-1');
            expect(mockOrderRepo.find).toHaveBeenCalledWith({ where: { sellerId: 'seller-1' }, order: { createdAt: 'DESC' } });
            expect(result).toHaveLength(1);
        });
    });

    describe('findById', () => {
        it('should return order if found', async () => {
            const result = await service.findById('o-123');
            expect(result).toEqual(mockOrder);
        });

        it('should throw NotFoundException if not found', async () => {
            mockOrderRepo.findOne.mockResolvedValueOnce(null);
            await expect(service.findById('o-999')).rejects.toThrow(NotFoundException);
        });
    });

    describe('updateStatus', () => {
        it('should update and save order status', async () => {
            mockOrderRepo.findOne.mockResolvedValueOnce(mockOrder);
            await service.updateStatus('o-123', OrderStatus.PAID);
            expect(mockOrderRepo.save).toHaveBeenCalled();
        });
    });

    describe('rateSeller', () => {
        it('should rate seller if called by buyer', async () => {
            mockOrderRepo.findOne.mockResolvedValueOnce({ ...mockOrder, buyerId: 'buyer-1' });
            await service.rateSeller('o-123', 'buyer-1', 5);
            expect(mockOrderRepo.save).toHaveBeenCalled();
        });

        it('should throw ForbiddenException if not the buyer', async () => {
            mockOrderRepo.findOne.mockResolvedValueOnce({ ...mockOrder, buyerId: 'buyer-1' });
            await expect(service.rateSeller('o-123', 'buyer-99', 5)).rejects.toThrow(ForbiddenException);
        });
    });

    describe('rateBuyer', () => {
        it('should rate buyer if called by seller', async () => {
            mockOrderRepo.findOne.mockResolvedValueOnce({ ...mockOrder, sellerId: 'seller-1' });
            await service.rateBuyer('o-123', 'seller-1', 4);
            expect(mockOrderRepo.save).toHaveBeenCalled();
        });

        it('should throw ForbiddenException if not the seller', async () => {
            mockOrderRepo.findOne.mockResolvedValueOnce({ ...mockOrder, sellerId: 'seller-1' });
            await expect(service.rateBuyer('o-123', 'seller-99', 4)).rejects.toThrow(ForbiddenException);
        });
    });
});

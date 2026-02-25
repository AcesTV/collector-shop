import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

const mockOrderService = {
    create: jest.fn(),
    findByBuyer: jest.fn(),
    findBySeller: jest.fn(),
    findById: jest.fn(),
    rateSeller: jest.fn(),
    rateBuyer: jest.fn(),
};

const mockReq = (roleIdField: string, val: string) => ({
    user: {
        userId: val,
    },
});

describe('OrderController', () => {
    let controller: OrderController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [OrderController],
            providers: [{ provide: OrderService, useValue: mockOrderService }],
        }).compile();

        controller = module.get<OrderController>(OrderController);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('health', () => {
        it('should return health status', () => {
            expect(controller.health()).toEqual({ status: 'ok', service: 'order-service' });
        });
    });

    describe('create', () => {
        it('should create order', async () => {
            mockOrderService.create.mockResolvedValue('order');
            const req = mockReq('userId', 'buyer-1');
            const result = await controller.create(req, { items: [] });
            expect(mockOrderService.create).toHaveBeenCalledWith('buyer-1', []);
            expect(result).toBe('order');
        });
    });

    describe('findMyPurchases', () => {
        it('should find purchases for buyer', async () => {
            mockOrderService.findByBuyer.mockResolvedValue(['order']);
            const req = mockReq('userId', 'buyer-1');
            const result = await controller.findMyPurchases(req);
            expect(mockOrderService.findByBuyer).toHaveBeenCalledWith('buyer-1');
            expect(result).toEqual(['order']);
        });
    });

    describe('findMySales', () => {
        it('should find sales for seller', async () => {
            mockOrderService.findBySeller.mockResolvedValue(['order']);
            const req = mockReq('userId', 'seller-1');
            const result = await controller.findMySales(req);
            expect(mockOrderService.findBySeller).toHaveBeenCalledWith('seller-1');
            expect(result).toEqual(['order']);
        });
    });

    describe('findOne', () => {
        it('should find one order by id', async () => {
            mockOrderService.findById.mockResolvedValue('order');
            const result = await controller.findOne('o-123');
            expect(mockOrderService.findById).toHaveBeenCalledWith('o-123');
            expect(result).toBe('order');
        });
    });

    describe('rateSeller', () => {
        it('should rate seller', async () => {
            mockOrderService.rateSeller.mockResolvedValue('order');
            const req = mockReq('userId', 'buyer-1');
            const result = await controller.rateSeller(req, 'o-123', { rating: 5 });
            expect(mockOrderService.rateSeller).toHaveBeenCalledWith('o-123', 'buyer-1', 5);
            expect(result).toBe('order');
        });
    });

    describe('rateBuyer', () => {
        it('should rate buyer', async () => {
            mockOrderService.rateBuyer.mockResolvedValue('order');
            const req = mockReq('userId', 'seller-1');
            const result = await controller.rateBuyer(req, 'o-123', { rating: 5 });
            expect(mockOrderService.rateBuyer).toHaveBeenCalledWith('o-123', 'seller-1', 5);
            expect(result).toBe('order');
        });
    });
});

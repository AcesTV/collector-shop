import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

const mockPaymentService = {
    initiatePayment: jest.fn(),
    confirmPayment: jest.fn(),
    refund: jest.fn(),
    findByOrder: jest.fn(),
};

const mockReq = (userId: string) => ({
    user: {
        userId,
    }
});

describe('PaymentController', () => {
    let controller: PaymentController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PaymentController],
            providers: [{ provide: PaymentService, useValue: mockPaymentService }],
        }).compile();

        controller = module.get<PaymentController>(PaymentController);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('health', () => {
        it('should return health status', () => {
            expect(controller.health()).toEqual({ status: 'ok', service: 'payment-service' });
        });
    });

    describe('initiate', () => {
        it('should initiate payment', async () => {
            mockPaymentService.initiatePayment.mockResolvedValue({ clientSecret: 'cs_123' });
            const req = mockReq('buyer-1');
            const result = await controller.initiate(req, { orderId: 'o-123', amount: 100 });
            expect(mockPaymentService.initiatePayment).toHaveBeenCalledWith('o-123', 'buyer-1', 100);
            expect(result).toEqual({ clientSecret: 'cs_123' });
        });
    });

    describe('confirm', () => {
        it('should confirm payment', async () => {
            mockPaymentService.confirmPayment.mockResolvedValue('transaction');
            const result = await controller.confirm('t-123');
            expect(mockPaymentService.confirmPayment).toHaveBeenCalledWith('t-123');
            expect(result).toBe('transaction');
        });
    });

    describe('refund', () => {
        it('should refund payment', async () => {
            mockPaymentService.refund.mockResolvedValue('transaction');
            const result = await controller.refund('t-123');
            expect(mockPaymentService.refund).toHaveBeenCalledWith('t-123');
            expect(result).toBe('transaction');
        });
    });

    describe('findByOrder', () => {
        it('should find transactions by order', async () => {
            mockPaymentService.findByOrder.mockResolvedValue(['transaction']);
            const result = await controller.findByOrder('o-123');
            expect(mockPaymentService.findByOrder).toHaveBeenCalledWith('o-123');
            expect(result).toEqual(['transaction']);
        });
    });
});

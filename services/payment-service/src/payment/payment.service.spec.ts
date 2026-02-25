import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Transaction, TransactionStatus } from './transaction.entity';
import { StripeProvider } from './stripe.provider';

const mockTransaction = {
    id: 't-123',
    orderId: 'o-123',
    buyerId: 'buyer-1',
    amount: 100,
    status: TransactionStatus.PENDING,
    stripePaymentIntentId: 'pi_test_123',
    paymentMethod: 'card',
    createdAt: new Date(),
    updatedAt: new Date(),
};

const mockTransactionRepo = {
    create: jest.fn().mockReturnValue(mockTransaction),
    save: jest.fn().mockResolvedValue(mockTransaction),
    findOne: jest.fn().mockResolvedValue(mockTransaction),
    find: jest.fn().mockResolvedValue([mockTransaction]),
};

const mockStripeProvider = {
    createPaymentIntent: jest.fn().mockResolvedValue({ paymentIntentId: 'pi_test_123', clientSecret: 'cs_test_123' }),
    confirmPayment: jest.fn().mockResolvedValue(true),
    refundPayment: jest.fn().mockResolvedValue(true),
};

describe('PaymentService', () => {
    let service: PaymentService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PaymentService,
                { provide: getRepositoryToken(Transaction), useValue: mockTransactionRepo },
                { provide: StripeProvider, useValue: mockStripeProvider },
            ],
        }).compile();

        service = module.get<PaymentService>(PaymentService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('initiatePayment', () => {
        it('should create payment intent and save pending transaction', async () => {
            const result = await service.initiatePayment('o-123', 'buyer-1', 100);
            expect(mockStripeProvider.createPaymentIntent).toHaveBeenCalledWith(100);
            expect(mockTransactionRepo.create).toHaveBeenCalled();
            expect(mockTransactionRepo.save).toHaveBeenCalled();
            expect(result.clientSecret).toBe('cs_test_123');
        });
    });

    describe('confirmPayment', () => {
        it('should mark transaction as completed', async () => {
            const result = await service.confirmPayment('t-123');
            expect(mockStripeProvider.confirmPayment).toHaveBeenCalledWith('pi_test_123');
            expect(mockTransactionRepo.save).toHaveBeenCalled();
            expect(result.status).toBe(TransactionStatus.COMPLETED); // As mocked transaction represents the object saved
        });

        it('should throw NotFoundException if transaction not found', async () => {
            mockTransactionRepo.findOne.mockResolvedValueOnce(null);
            await expect(service.confirmPayment('t-999')).rejects.toThrow(NotFoundException);
        });
    });

    describe('refund', () => {
        it('should mark transaction as refunded', async () => {
            const result = await service.refund('t-123');
            expect(mockStripeProvider.refundPayment).toHaveBeenCalledWith('pi_test_123');
            expect(mockTransactionRepo.save).toHaveBeenCalled();
        });

        it('should throw NotFoundException if transaction not found', async () => {
            mockTransactionRepo.findOne.mockResolvedValueOnce(null);
            await expect(service.refund('t-999')).rejects.toThrow(NotFoundException);
        });
    });

    describe('findByOrder', () => {
        it('should return transactions for order', async () => {
            const result = await service.findByOrder('o-123');
            expect(mockTransactionRepo.find).toHaveBeenCalledWith({ where: { orderId: 'o-123' } });
            expect(result).toHaveLength(1);
        });
    });
});

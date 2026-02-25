import { Test, TestingModule } from '@nestjs/testing';
import { FraudController } from './fraud.controller';
import { FraudService } from './fraud.service';

const mockFraudService = {
    analyzePriceChange: jest.fn(),
    findAll: jest.fn(),
    resolve: jest.fn(),
};

const mockReq = { user: { userId: 'admin-1' } };

describe('FraudController', () => {
    let controller: FraudController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [FraudController],
            providers: [{ provide: FraudService, useValue: mockFraudService }],
        }).compile();
        controller = module.get<FraudController>(FraudController);
        jest.clearAllMocks();
    });

    it('should be defined', () => { expect(controller).toBeDefined(); });

    describe('health', () => {
        it('should return health status', () => {
            expect(controller.health()).toEqual({ status: 'ok', service: 'fraud-service' });
        });
    });

    describe('analyzePriceChange', () => {
        it('should analyze price change', async () => {
            mockFraudService.analyzePriceChange.mockResolvedValue('alert');
            const body = { productId: 'p-1', newPrice: 1000 };
            const res = await controller.analyzePriceChange(body);
            expect(mockFraudService.analyzePriceChange).toHaveBeenCalledWith(body);
        });
    });

    describe('findAlerts', () => {
        it('should return all alerts without filter', async () => {
            mockFraudService.findAll.mockResolvedValue(['alert']);
            const res = await controller.findAlerts(undefined);
            expect(mockFraudService.findAll).toHaveBeenCalledWith(undefined);
        });

        it('should filter by resolved=true', async () => {
            mockFraudService.findAll.mockResolvedValue(['alert']);
            const res = await controller.findAlerts('true');
            expect(mockFraudService.findAll).toHaveBeenCalledWith(true);
        });

        it('should filter by resolved=false', async () => {
            mockFraudService.findAll.mockResolvedValue(['alert']);
            const res = await controller.findAlerts('false');
            expect(mockFraudService.findAll).toHaveBeenCalledWith(false);
        });
    });

    describe('resolve', () => {
        it('should resolve an alert', async () => {
            mockFraudService.resolve.mockResolvedValue('alert');
            const res = await controller.resolve(mockReq, 'a-1');
            expect(mockFraudService.resolve).toHaveBeenCalledWith('a-1', 'admin-1');
        });
    });
});

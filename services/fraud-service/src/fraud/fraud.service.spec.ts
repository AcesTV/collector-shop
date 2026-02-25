import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FraudService } from './fraud.service';
import { FraudAlert, AlertType, AlertSeverity } from './fraud-alert.entity';
import { PriceAnomalyRule } from './rules/price-anomaly.rule';

const mockAlert = {
    id: 'a-1', type: AlertType.PRICE_ANOMALY, severity: AlertSeverity.HIGH,
    productId: 'p-1', sellerId: 's-1', description: 'Price anomaly',
    details: {}, isResolved: false, resolvedBy: null, createdAt: new Date(),
};

const mockAlertRepo = {
    create: jest.fn().mockReturnValue(mockAlert),
    save: jest.fn().mockResolvedValue(mockAlert),
    find: jest.fn().mockResolvedValue([mockAlert]),
    findOne: jest.fn().mockResolvedValue(mockAlert),
};

const mockPriceRule = {
    checkPriceAnomaly: jest.fn(),
    checkRapidPriceChange: jest.fn(),
};

describe('FraudService', () => {
    let service: FraudService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FraudService,
                { provide: getRepositoryToken(FraudAlert), useValue: mockAlertRepo },
                { provide: PriceAnomalyRule, useValue: mockPriceRule },
            ],
        }).compile();
        service = module.get<FraudService>(FraudService);
        jest.clearAllMocks();
    });

    it('should be defined', () => { expect(service).toBeDefined(); });

    describe('analyzePriceChange', () => {
        const data = { productId: 'p-1', sellerId: 's-1', newPrice: 1000, oldPrice: 50, categoryAvgPrice: 100, priceHistory: [] };

        it('should create alert on price anomaly', async () => {
            mockPriceRule.checkPriceAnomaly.mockReturnValue({ isAnomaly: true, severity: 'high', reason: 'Too expensive' });
            mockPriceRule.checkRapidPriceChange.mockReturnValue({ isAnomaly: false, severity: 'none', reason: '' });
            const res = await service.analyzePriceChange(data);
            expect(mockAlertRepo.create).toHaveBeenCalled();
            expect(res).toEqual(mockAlert);
        });

        it('should create alert on rapid price change', async () => {
            mockPriceRule.checkPriceAnomaly.mockReturnValue({ isAnomaly: false, severity: 'none', reason: '' });
            mockPriceRule.checkRapidPriceChange.mockReturnValue({ isAnomaly: true, severity: 'high', reason: 'Rapid change' });
            const res = await service.analyzePriceChange(data);
            expect(mockAlertRepo.create).toHaveBeenCalled();
        });

        it('should return null if no anomaly', async () => {
            mockPriceRule.checkPriceAnomaly.mockReturnValue({ isAnomaly: false, severity: 'none', reason: '' });
            mockPriceRule.checkRapidPriceChange.mockReturnValue({ isAnomaly: false, severity: 'none', reason: '' });
            const res = await service.analyzePriceChange(data);
            expect(res).toBeNull();
        });
    });

    describe('findAll', () => {
        it('should return all alerts', async () => {
            const res = await service.findAll();
            expect(mockAlertRepo.find).toHaveBeenCalled();
        });

        it('should filter by resolved status', async () => {
            await service.findAll(true);
            expect(mockAlertRepo.find).toHaveBeenCalledWith(expect.objectContaining({ where: { isResolved: true } }));
        });
    });

    describe('resolve', () => {
        it('should resolve an alert', async () => {
            mockAlertRepo.findOne.mockResolvedValue({ ...mockAlert });
            const res = await service.resolve('a-1', 'admin-1');
            expect(mockAlertRepo.save).toHaveBeenCalled();
        });

        it('should throw if alert not found', async () => {
            mockAlertRepo.findOne.mockResolvedValue(null);
            await expect(service.resolve('a-99', 'admin-1')).rejects.toThrow();
        });
    });
});

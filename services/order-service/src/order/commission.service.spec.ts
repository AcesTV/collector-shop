import { CommissionService } from './commission.service';

describe('CommissionService', () => {
    let service: CommissionService;

    beforeEach(() => {
        service = new CommissionService();
    });

    it('should be defined', () => { expect(service).toBeDefined(); });

    describe('calculate', () => {
        it('should calculate 5% commission on 100', () => {
            const result = service.calculate(100);
            expect(result.commission).toBe(5);
            expect(result.total).toBe(105);
        });

        it('should calculate 5% commission on 200', () => {
            const result = service.calculate(200);
            expect(result.commission).toBe(10);
            expect(result.total).toBe(210);
        });

        it('should handle small amounts with rounding', () => {
            const result = service.calculate(1.01);
            expect(result.commission).toBe(0.05);
            expect(result.total).toBe(1.06);
        });

        it('should handle zero', () => {
            const result = service.calculate(0);
            expect(result.commission).toBe(0);
            expect(result.total).toBe(0);
        });

        it('should round to 2 decimal places', () => {
            const result = service.calculate(33.33);
            expect(result.commission).toBe(1.67);
            expect(result.total).toBe(35);
        });
    });
});

import { PriceAnomalyRule } from './price-anomaly.rule';

describe('PriceAnomalyRule', () => {
    let rule: PriceAnomalyRule;

    beforeEach(() => {
        rule = new PriceAnomalyRule();
    });

    it('should be defined', () => { expect(rule).toBeDefined(); });

    describe('checkPriceAnomaly', () => {
        it('should detect high severity when ratio > 10', () => {
            const result = rule.checkPriceAnomaly(1100, 100);
            expect(result.isAnomaly).toBe(true);
            expect(result.severity).toBe('high');
        });

        it('should detect medium severity when ratio > 5', () => {
            const result = rule.checkPriceAnomaly(600, 100);
            expect(result.isAnomaly).toBe(true);
            expect(result.severity).toBe('medium');
        });

        it('should not flag normal prices', () => {
            const result = rule.checkPriceAnomaly(150, 100);
            expect(result.isAnomaly).toBe(false);
            expect(result.severity).toBe('none');
        });
    });

    describe('checkRapidPriceChange', () => {
        it('should detect rapid change > 50%', () => {
            const history = [
                { price: 100, date: new Date() },
                { price: 200, date: new Date() },
            ];
            const result = rule.checkRapidPriceChange(history);
            expect(result.isAnomaly).toBe(true);
            expect(result.severity).toBe('high');
        });

        it('should not flag small changes', () => {
            const history = [
                { price: 100, date: new Date() },
                { price: 110, date: new Date() },
            ];
            const result = rule.checkRapidPriceChange(history);
            expect(result.isAnomaly).toBe(false);
        });

        it('should return false with < 2 history items', () => {
            const result = rule.checkRapidPriceChange([{ price: 100, date: new Date() }]);
            expect(result.isAnomaly).toBe(false);
        });

        it('should return false with empty history', () => {
            const result = rule.checkRapidPriceChange([]);
            expect(result.isAnomaly).toBe(false);
        });
    });
});

import { StripeProvider } from './stripe.provider';

describe('StripeProvider', () => {
    let provider: StripeProvider;

    beforeEach(() => {
        provider = new StripeProvider();
    });

    it('should be defined', () => { expect(provider).toBeDefined(); });

    describe('createPaymentIntent', () => {
        it('should return a simulated payment intent', async () => {
            const result = await provider.createPaymentIntent(100);
            expect(result.paymentIntentId).toMatch(/^pi_simulated_/);
            expect(result.clientSecret).toContain('_secret_simulated');
            expect(result.status).toBe('requires_payment_method');
        });

        it('should accept currency parameter', async () => {
            const result = await provider.createPaymentIntent(50, 'usd');
            expect(result.paymentIntentId).toBeDefined();
        });
    });

    describe('confirmPayment', () => {
        it('should confirm payment and return succeeded', async () => {
            const result = await provider.confirmPayment('pi_test_123');
            expect(result.status).toBe('succeeded');
        });
    });

    describe('refundPayment', () => {
        it('should refund payment and return refunded', async () => {
            const result = await provider.refundPayment('pi_test_123');
            expect(result.status).toBe('refunded');
        });
    });
});

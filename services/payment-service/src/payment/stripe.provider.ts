import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';

/**
 * Stripe Payment Provider
 * Simulé pour le POC - à remplacer par une vraie intégration Stripe
 */
@Injectable()
export class StripeProvider {
  private readonly logger = new Logger(StripeProvider.name);

  async createPaymentIntent(
    amount: number,
    currency = 'eur',
  ): Promise<{
    paymentIntentId: string;
    clientSecret: string;
    status: string;
  }> {
    // Simulation Stripe pour le POC
    this.logger.log(`💳 Creating payment intent: ${amount} ${currency}`);
    const paymentIntentId = `pi_simulated_${Date.now()}_${randomUUID().split('-')[0]}`;

    return {
      paymentIntentId,
      clientSecret: `${paymentIntentId}_secret_simulated`,
      status: 'requires_payment_method',
    };
  }

  async confirmPayment(paymentIntentId: string): Promise<{ status: string }> {
    this.logger.log(`✅ Confirming payment: ${paymentIntentId}`);
    return { status: 'succeeded' };
  }

  async refundPayment(paymentIntentId: string): Promise<{ status: string }> {
    this.logger.log(`↩️ Refunding payment: ${paymentIntentId}`);
    return { status: 'refunded' };
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionStatus } from './transaction.entity';
import { StripeProvider } from './stripe.provider';

@Injectable()
export class PaymentService {
    constructor(
        @InjectRepository(Transaction)
        private readonly transactionRepo: Repository<Transaction>,
        private readonly stripeProvider: StripeProvider,
    ) { }

    async initiatePayment(orderId: string, buyerId: string, amount: number) {
        const stripe = await this.stripeProvider.createPaymentIntent(amount);

        const transaction = this.transactionRepo.create({
            orderId,
            buyerId,
            amount,
            status: TransactionStatus.PENDING,
            stripePaymentIntentId: stripe.paymentIntentId,
        });

        await this.transactionRepo.save(transaction);

        return {
            transactionId: transaction.id,
            clientSecret: stripe.clientSecret,
        };
    }

    async confirmPayment(transactionId: string) {
        const transaction = await this.transactionRepo.findOne({ where: { id: transactionId } });
        if (!transaction) throw new NotFoundException('Transaction not found');

        await this.stripeProvider.confirmPayment(transaction.stripePaymentIntentId!);
        transaction.status = TransactionStatus.COMPLETED;
        return this.transactionRepo.save(transaction);
    }

    async refund(transactionId: string) {
        const transaction = await this.transactionRepo.findOne({ where: { id: transactionId } });
        if (!transaction) throw new NotFoundException('Transaction not found');

        await this.stripeProvider.refundPayment(transaction.stripePaymentIntentId!);
        transaction.status = TransactionStatus.REFUNDED;
        return this.transactionRepo.save(transaction);
    }

    async findByOrder(orderId: string) {
        return this.transactionRepo.find({ where: { orderId } });
    }
}

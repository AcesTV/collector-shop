import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { Transaction } from './transaction.entity';
import { StripeProvider } from './stripe.provider';

@Module({
    imports: [TypeOrmModule.forFeature([Transaction])],
    controllers: [PaymentController],
    providers: [PaymentService, StripeProvider],
})
export class PaymentModule { }

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FraudController } from './fraud.controller';
import { FraudService } from './fraud.service';
import { FraudAlert } from './fraud-alert.entity';
import { PriceAnomalyRule } from './rules/price-anomaly.rule';

@Module({
    imports: [TypeOrmModule.forFeature([FraudAlert])],
    controllers: [FraudController],
    providers: [FraudService, PriceAnomalyRule],
})
export class FraudModule { }

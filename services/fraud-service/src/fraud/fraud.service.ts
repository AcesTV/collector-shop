import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FraudAlert, AlertType, AlertSeverity } from './fraud-alert.entity';
import { PriceAnomalyRule } from './rules/price-anomaly.rule';

@Injectable()
export class FraudService {
    constructor(
        @InjectRepository(FraudAlert) private alertRepo: Repository<FraudAlert>,
        private readonly priceRule: PriceAnomalyRule,
    ) { }

    async analyzePriceChange(data: {
        productId: string;
        sellerId: string;
        newPrice: number;
        oldPrice: number;
        categoryAvgPrice: number;
        priceHistory: { price: number; date: Date }[];
    }): Promise<FraudAlert | null> {
        // Vérifier anomalie de prix
        const priceCheck = this.priceRule.checkPriceAnomaly(data.newPrice, data.categoryAvgPrice);
        if (priceCheck.isAnomaly) {
            return this.createAlert({
                type: AlertType.PRICE_ANOMALY,
                severity: priceCheck.severity as AlertSeverity,
                productId: data.productId,
                sellerId: data.sellerId,
                description: priceCheck.reason,
                details: { newPrice: data.newPrice, categoryAvg: data.categoryAvgPrice },
            });
        }

        // Vérifier changement rapide
        const rapidCheck = this.priceRule.checkRapidPriceChange(data.priceHistory);
        if (rapidCheck.isAnomaly) {
            return this.createAlert({
                type: AlertType.RAPID_PRICE_CHANGE,
                severity: rapidCheck.severity as AlertSeverity,
                productId: data.productId,
                sellerId: data.sellerId,
                description: rapidCheck.reason,
                details: { newPrice: data.newPrice, oldPrice: data.oldPrice },
            });
        }

        return null;
    }

    async createAlert(data: Partial<FraudAlert>): Promise<FraudAlert> {
        const alert = this.alertRepo.create(data);
        return this.alertRepo.save(alert);
    }

    async findAll(resolved?: boolean): Promise<FraudAlert[]> {
        const where = resolved !== undefined ? { isResolved: resolved } : {};
        return this.alertRepo.find({ where, order: { createdAt: 'DESC' } });
    }

    async resolve(id: string, adminId: string): Promise<FraudAlert> {
        const alert = await this.alertRepo.findOne({ where: { id } });
        if (!alert) throw new Error('Alert not found');
        alert.isResolved = true;
        alert.resolvedBy = adminId;
        return this.alertRepo.save(alert);
    }
}

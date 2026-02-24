import { Injectable, Logger } from '@nestjs/common';

/**
 * Règle de détection d'anomalie de prix
 * Détecte les prix anormalement élevés ou les changements de prix suspects
 */
@Injectable()
export class PriceAnomalyRule {
    private readonly logger = new Logger(PriceAnomalyRule.name);

    /**
     * Vérifie si le prix est anormalement élevé par rapport à la catégorie
     */
    checkPriceAnomaly(price: number, categoryAvgPrice: number): {
        isAnomaly: boolean;
        severity: string;
        reason: string;
    } {
        const ratio = price / categoryAvgPrice;

        if (ratio > 10) {
            return {
                isAnomaly: true,
                severity: 'high',
                reason: `Prix ${ratio.toFixed(1)}x supérieur à la moyenne de la catégorie`,
            };
        }

        if (ratio > 5) {
            return {
                isAnomaly: true,
                severity: 'medium',
                reason: `Prix ${ratio.toFixed(1)}x supérieur à la moyenne de la catégorie`,
            };
        }

        return { isAnomaly: false, severity: 'none', reason: '' };
    }

    /**
     * Vérifie les changements de prix rapides et suspects
     */
    checkRapidPriceChange(priceHistory: { price: number; date: Date }[]): {
        isAnomaly: boolean;
        severity: string;
        reason: string;
    } {
        if (priceHistory.length < 2) {
            return { isAnomaly: false, severity: 'none', reason: '' };
        }

        const latest = priceHistory[priceHistory.length - 1];
        const previous = priceHistory[priceHistory.length - 2];
        const changePercent = Math.abs((latest.price - previous.price) / previous.price) * 100;

        if (changePercent > 50) {
            return {
                isAnomaly: true,
                severity: 'high',
                reason: `Changement de prix de ${changePercent.toFixed(0)}% détecté`,
            };
        }

        return { isAnomaly: false, severity: 'none', reason: '' };
    }
}

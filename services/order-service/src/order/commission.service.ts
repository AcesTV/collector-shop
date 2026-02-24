import { Injectable } from '@nestjs/common';

const COMMISSION_RATE = 0.05; // 5%

@Injectable()
export class CommissionService {
    /**
     * Calcule la commission Collector (5%) sur le sous-total
     */
    calculate(subtotal: number): { commission: number; total: number } {
        const commission = Math.round(subtotal * COMMISSION_RATE * 100) / 100;
        const total = Math.round((subtotal + commission) * 100) / 100;
        return { commission, total };
    }
}

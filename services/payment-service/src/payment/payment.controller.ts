import { Controller, Post, Get, Param, Body, UseGuards, Req } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { KeycloakGuard } from '../auth/keycloak.guard';

@Controller()
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    @Get('health')
    health() { return { status: 'ok', service: 'payment-service' }; }

    @Post('initiate')
    @UseGuards(KeycloakGuard)
    initiate(@Req() req: any, @Body() body: { orderId: string; amount: number }) {
        return this.paymentService.initiatePayment(body.orderId, req.user.userId, body.amount);
    }

    @Post(':id/confirm')
    @UseGuards(KeycloakGuard)
    confirm(@Param('id') id: string) {
        return this.paymentService.confirmPayment(id);
    }

    @Post(':id/refund')
    @UseGuards(KeycloakGuard)
    refund(@Param('id') id: string) {
        return this.paymentService.refund(id);
    }

    @Get('order/:orderId')
    @UseGuards(KeycloakGuard)
    findByOrder(@Param('orderId') orderId: string) {
        return this.paymentService.findByOrder(orderId);
    }
}

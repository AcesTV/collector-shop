import { Controller, Get, Post, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
import { OrderService } from './order.service';
import { KeycloakGuard } from '../auth/keycloak.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller()
export class OrderController {
    constructor(private readonly orderService: OrderService) { }

    @Get('health')
    health() { return { status: 'ok', service: 'order-service' }; }

    @Post()
    @UseGuards(KeycloakGuard, RolesGuard)
    @Roles('buyer')
    create(@Req() req: any, @Body() body: { items: any[] }) {
        return this.orderService.create(req.user.userId, body.items);
    }

    @Get('buyer/mine')
    @UseGuards(KeycloakGuard)
    findMyPurchases(@Req() req: any) {
        return this.orderService.findByBuyer(req.user.userId);
    }

    @Get('seller/mine')
    @UseGuards(KeycloakGuard, RolesGuard)
    @Roles('seller')
    findMySales(@Req() req: any) {
        return this.orderService.findBySeller(req.user.userId);
    }

    @Get(':id')
    @UseGuards(KeycloakGuard)
    findOne(@Param('id') id: string) {
        return this.orderService.findById(id);
    }

    @Patch(':id/rate-seller')
    @UseGuards(KeycloakGuard)
    rateSeller(@Req() req: any, @Param('id') id: string, @Body() body: { rating: number }) {
        return this.orderService.rateSeller(id, req.user.userId, body.rating);
    }

    @Patch(':id/rate-buyer')
    @UseGuards(KeycloakGuard, RolesGuard)
    @Roles('seller')
    rateBuyer(@Req() req: any, @Param('id') id: string, @Body() body: { rating: number }) {
        return this.orderService.rateBuyer(id, req.user.userId, body.rating);
    }
}

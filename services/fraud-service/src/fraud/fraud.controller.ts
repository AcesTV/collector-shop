import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { FraudService } from './fraud.service';
import { KeycloakGuard } from '../auth/keycloak.guard';

@Controller()
export class FraudController {
    constructor(private readonly fraudService: FraudService) { }

    @Get('health')
    health() { return { status: 'ok', service: 'fraud-service' }; }

    // Internal: analyze price change
    @Post('analyze/price')
    analyzePriceChange(@Body() body: any) {
        return this.fraudService.analyzePriceChange(body);
    }

    // Admin: list alerts
    @Get('alerts')
    @UseGuards(KeycloakGuard)
    findAlerts(@Query('resolved') resolved?: string) {
        const isResolved = resolved !== undefined ? resolved === 'true' : undefined;
        return this.fraudService.findAll(isResolved);
    }

    // Admin: resolve alert
    @Patch('alerts/:id/resolve')
    @UseGuards(KeycloakGuard)
    resolve(@Req() req: any, @Param('id') id: string) {
        return this.fraudService.resolve(id, req.user.userId);
    }
}

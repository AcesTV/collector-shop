import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ShopService } from './shop.service';
import { KeycloakGuard } from '../auth/keycloak.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('shops')
export class ShopController {
    constructor(private readonly shopService: ShopService) { }

    // Public: view a shop
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.shopService.findById(id);
    }

    // Seller: list own shops
    @Get('seller/mine')
    @UseGuards(KeycloakGuard, RolesGuard)
    @Roles('seller')
    findMine(@Req() req: any) {
        return this.shopService.findBySeller(req.user.userId);
    }

    // Seller: create shop
    @Post()
    @UseGuards(KeycloakGuard, RolesGuard)
    @Roles('seller')
    create(@Req() req: any, @Body() body: { name: string; description?: string }) {
        return this.shopService.create(req.user.userId, body.name, body.description);
    }

    // Seller: update own shop
    @Put(':id')
    @UseGuards(KeycloakGuard, RolesGuard)
    @Roles('seller')
    update(@Req() req: any, @Param('id') id: string, @Body() body: Partial<{ name: string; description: string }>) {
        return this.shopService.update(id, req.user.userId, body);
    }

    // Seller: delete own shop
    @Delete(':id')
    @UseGuards(KeycloakGuard, RolesGuard)
    @Roles('seller')
    delete(@Req() req: any, @Param('id') id: string) {
        return this.shopService.delete(id, req.user.userId);
    }
}

import {
    Controller, Get, Post, Put, Patch, Delete,
    Body, Param, Query, UseGuards, Req,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto, UpdateProductStatusDto } from './dto';
import { ProductStatus } from './product.entity';
import { KeycloakGuard } from '../auth/keycloak.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('products')
export class ProductController {
    constructor(private readonly productService: ProductService) { }

    // Public: browse catalog
    @Get()
    findAll(
        @Query('categoryId') categoryId?: string,
        @Query('search') search?: string,
    ) {
        return this.productService.findAll({
            categoryId,
            search,
            status: ProductStatus.APPROVED,
        });
    }

    // Seller: list own products (all statuses) — MUST be before :id
    @Get('seller/mine')
    @UseGuards(KeycloakGuard, RolesGuard)
    @Roles('seller')
    findMine(@Req() req: any) {
        return this.productService.findAll({ sellerId: req.user.userId });
    }

    // Admin: list pending moderation — MUST be before :id
    @Get('admin/pending')
    @UseGuards(KeycloakGuard, RolesGuard)
    @Roles('admin')
    findPending() {
        return this.productService.findPending();
    }

    // Public: product detail
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.productService.findById(id);
    }

    // Seller: create product
    @Post()
    @UseGuards(KeycloakGuard, RolesGuard)
    @Roles('seller')
    create(@Req() req: any, @Body() dto: CreateProductDto) {
        return this.productService.create(req.user.userId, dto);
    }

    // Seller: update own product
    @Put(':id')
    @UseGuards(KeycloakGuard, RolesGuard)
    @Roles('seller')
    update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateProductDto) {
        return this.productService.update(id, req.user.userId, dto);
    }

    // Seller: delete own product
    @Delete(':id')
    @UseGuards(KeycloakGuard, RolesGuard)
    @Roles('seller')
    delete(@Req() req: any, @Param('id') id: string) {
        return this.productService.delete(id, req.user.userId);
    }

    // Admin: approve/reject product
    @Patch(':id/status')
    @UseGuards(KeycloakGuard, RolesGuard)
    @Roles('admin')
    updateStatus(@Param('id') id: string, @Body() dto: UpdateProductStatusDto) {
        return this.productService.updateStatus(id, dto.status as ProductStatus);
    }
}

import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { KeycloakGuard } from '../auth/keycloak.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('categories')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) { }

    // Public: list categories
    @Get()
    findAll() {
        return this.categoryService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.categoryService.findById(id);
    }

    // Admin only: create category
    @Post()
    @UseGuards(KeycloakGuard, RolesGuard)
    @Roles('admin')
    create(@Body() body: { name: string; description?: string; iconUrl?: string }) {
        return this.categoryService.create(body.name, body.description, body.iconUrl);
    }

    // Admin only: update category
    @Put(':id')
    @UseGuards(KeycloakGuard, RolesGuard)
    @Roles('admin')
    update(@Param('id') id: string, @Body() body: Partial<{ name: string; description: string; iconUrl: string }>) {
        return this.categoryService.update(id, body);
    }

    // Admin only: delete category
    @Delete(':id')
    @UseGuards(KeycloakGuard, RolesGuard)
    @Roles('admin')
    delete(@Param('id') id: string) {
        return this.categoryService.delete(id);
    }
}

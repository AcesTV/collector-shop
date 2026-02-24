import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';

@Injectable()
export class CategoryService {
    constructor(
        @InjectRepository(Category)
        private readonly categoryRepo: Repository<Category>,
    ) { }

    async create(name: string, description?: string, iconUrl?: string): Promise<Category> {
        const category = this.categoryRepo.create({ name, description, iconUrl });
        return this.categoryRepo.save(category);
    }

    async findAll(): Promise<Category[]> {
        return this.categoryRepo.find({ order: { sortOrder: 'ASC', name: 'ASC' } });
    }

    async findById(id: string): Promise<Category> {
        const category = await this.categoryRepo.findOne({ where: { id } });
        if (!category) throw new NotFoundException('Category not found');
        return category;
    }

    async update(id: string, data: Partial<Category>): Promise<Category> {
        const category = await this.findById(id);
        Object.assign(category, data);
        return this.categoryRepo.save(category);
    }

    async delete(id: string): Promise<void> {
        const category = await this.findById(id);
        await this.categoryRepo.remove(category);
    }
}

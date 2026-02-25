import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';

const mockCategoryService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
};

describe('CategoryController', () => {
    let controller: CategoryController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CategoryController],
            providers: [{ provide: CategoryService, useValue: mockCategoryService }],
        }).compile();
        controller = module.get<CategoryController>(CategoryController);
        jest.clearAllMocks();
    });

    it('should be defined', () => { expect(controller).toBeDefined(); });

    describe('findAll', () => {
        it('should return all categories', async () => {
            mockCategoryService.findAll.mockResolvedValue(['cat']);
            const res = await controller.findAll();
            expect(mockCategoryService.findAll).toHaveBeenCalled();
            expect(res).toEqual(['cat']);
        });
    });

    describe('findOne', () => {
        it('should return one category', async () => {
            mockCategoryService.findById.mockResolvedValue('cat');
            const res = await controller.findOne('c-1');
            expect(mockCategoryService.findById).toHaveBeenCalledWith('c-1');
        });
    });

    describe('create', () => {
        it('should create a category', async () => {
            mockCategoryService.create.mockResolvedValue('cat');
            const res = await controller.create({ name: 'Vinyl', description: 'Records', iconUrl: 'url' });
            expect(mockCategoryService.create).toHaveBeenCalledWith('Vinyl', 'Records', 'url');
        });
    });

    describe('update', () => {
        it('should update a category', async () => {
            mockCategoryService.update.mockResolvedValue('cat');
            const res = await controller.update('c-1', { name: 'Updated' });
            expect(mockCategoryService.update).toHaveBeenCalledWith('c-1', { name: 'Updated' });
        });
    });

    describe('delete', () => {
        it('should delete a category', async () => {
            mockCategoryService.delete.mockResolvedValue(undefined);
            await controller.delete('c-1');
            expect(mockCategoryService.delete).toHaveBeenCalledWith('c-1');
        });
    });
});

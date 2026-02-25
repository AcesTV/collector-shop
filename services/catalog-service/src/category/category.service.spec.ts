import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { CategoryService } from './category.service';
import { Category } from './category.entity';

// ── Helpers ────────────────────────────────────────────────
const mockCategory = (overrides: Partial<Category> = {}): Category => ({
    id: 'cat-1',
    name: 'Figurines',
    description: 'Figurines de collection',
    iconUrl: 'https://cdn.example.com/fig.png',
    sortOrder: 0,
    createdAt: new Date(),
    ...overrides,
});

const createMockRepository = () => ({
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
});

// ── Test Suite ─────────────────────────────────────────────
describe('CategoryService', () => {
    let service: CategoryService;
    let repo: ReturnType<typeof createMockRepository>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CategoryService,
                {
                    provide: getRepositoryToken(Category),
                    useFactory: createMockRepository,
                },
            ],
        }).compile();

        service = module.get<CategoryService>(CategoryService);
        repo = module.get(getRepositoryToken(Category));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    // ── create() ───────────────────────────────────────────
    describe('create()', () => {
        it('should create and save a new category', async () => {
            const category = mockCategory();
            repo.create.mockReturnValue(category);
            repo.save.mockResolvedValue(category);

            const result = await service.create('Figurines', 'Figurines de collection', 'https://cdn.example.com/fig.png');

            expect(repo.create).toHaveBeenCalledWith({
                name: 'Figurines',
                description: 'Figurines de collection',
                iconUrl: 'https://cdn.example.com/fig.png',
            });
            expect(repo.save).toHaveBeenCalledWith(category);
            expect(result).toEqual(category);
        });

        it('should create a category without optional fields', async () => {
            const category = mockCategory({ description: undefined, iconUrl: undefined });
            repo.create.mockReturnValue(category);
            repo.save.mockResolvedValue(category);

            const result = await service.create('Baskets');

            expect(repo.create).toHaveBeenCalledWith({
                name: 'Baskets',
                description: undefined,
                iconUrl: undefined,
            });
            expect(result).toEqual(category);
        });
    });

    // ── findAll() ──────────────────────────────────────────
    describe('findAll()', () => {
        it('should return categories ordered by sortOrder ASC then name ASC', async () => {
            const categories = [mockCategory(), mockCategory({ id: 'cat-2', name: 'Posters' })];
            repo.find.mockResolvedValue(categories);

            const result = await service.findAll();

            expect(repo.find).toHaveBeenCalledWith({
                order: { sortOrder: 'ASC', name: 'ASC' },
            });
            expect(result).toHaveLength(2);
        });
    });

    // ── findById() ─────────────────────────────────────────
    describe('findById()', () => {
        it('should return the category when found', async () => {
            const category = mockCategory();
            repo.findOne.mockResolvedValue(category);

            const result = await service.findById('cat-1');

            expect(result).toEqual(category);
        });

        it('should throw NotFoundException when category does not exist', async () => {
            repo.findOne.mockResolvedValue(null);

            await expect(service.findById('cat-unknown')).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    // ── update() ───────────────────────────────────────────
    describe('update()', () => {
        it('should update and return the modified category', async () => {
            const existing = mockCategory();
            repo.findOne.mockResolvedValue(existing);
            repo.save.mockImplementation((c) => Promise.resolve(c));

            const result = await service.update('cat-1', { name: 'Figurines Rares' });

            expect(result.name).toBe('Figurines Rares');
            expect(repo.save).toHaveBeenCalled();
        });

        it('should throw NotFoundException if updating a non-existent category', async () => {
            repo.findOne.mockResolvedValue(null);

            await expect(service.update('cat-unknown', { name: 'x' })).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    // ── delete() ───────────────────────────────────────────
    describe('delete()', () => {
        it('should remove the category if found', async () => {
            const existing = mockCategory();
            repo.findOne.mockResolvedValue(existing);
            repo.remove.mockResolvedValue(undefined);

            await service.delete('cat-1');

            expect(repo.remove).toHaveBeenCalledWith(existing);
        });

        it('should throw NotFoundException if deleting a non-existent category', async () => {
            repo.findOne.mockResolvedValue(null);

            await expect(service.delete('cat-unknown')).rejects.toThrow(
                NotFoundException,
            );
        });
    });
});

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';

const mockUser: User = {
    id: 'u-123',
    keycloakId: 'kc-123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    avatarUrl: 'http://example.com/avatar.png',
    interests: [],
    notifyNewArticle: true,
    notifyPriceChange: true,
    notifyByEmail: false,
    createdAt: new Date(),
    updatedAt: new Date(),
};

const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
};

describe('UserService', () => {
    let service: UserService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUserRepository,
                },
            ],
        }).compile();

        service = module.get<UserService>(UserService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findOrCreate', () => {
        const kcUser = {
            userId: 'kc-123',
            email: 'test@example.com',
            firstName: 'John',
            lastName: 'Doe',
        };

        it('should return existing user if found', async () => {
            mockUserRepository.findOne.mockResolvedValue(mockUser);
            const user = await service.findOrCreate(kcUser);

            expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { keycloakId: kcUser.userId } });
            expect(mockUserRepository.create).not.toHaveBeenCalled();
            expect(mockUserRepository.save).not.toHaveBeenCalled();
            expect(user).toEqual(mockUser);
        });

        it('should create and return newly created user if not found', async () => {
            mockUserRepository.findOne.mockResolvedValue(null);
            mockUserRepository.create.mockReturnValue(mockUser);
            mockUserRepository.save.mockResolvedValue(mockUser);

            const user = await service.findOrCreate(kcUser);

            expect(mockUserRepository.create).toHaveBeenCalledWith({
                keycloakId: kcUser.userId,
                email: kcUser.email,
                firstName: kcUser.firstName,
                lastName: kcUser.lastName,
            });
            expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
            expect(user).toEqual(mockUser);
        });
    });

    describe('findByKeycloakId', () => {
        it('should return user by keycloakId', async () => {
            mockUserRepository.findOne.mockResolvedValue(mockUser);
            const user = await service.findByKeycloakId('kc-123');
            expect(user).toEqual(mockUser);
            expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { keycloakId: 'kc-123' } });
        });

        it('should throw NotFoundException if user not found by keycloakId', async () => {
            mockUserRepository.findOne.mockResolvedValue(null);
            await expect(service.findByKeycloakId('kc-none')).rejects.toThrow(NotFoundException);
        });
    });

    describe('findById', () => {
        it('should return user by id', async () => {
            mockUserRepository.findOne.mockResolvedValue(mockUser);
            const user = await service.findById('u-123');
            expect(user).toEqual(mockUser);
            expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: 'u-123' } });
        });

        it('should throw NotFoundException if user not found by id', async () => {
            mockUserRepository.findOne.mockResolvedValue(null);
            await expect(service.findById('u-none')).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('should update user given a keycloakId and fields', async () => {
            mockUserRepository.findOne.mockResolvedValue(mockUser);
            mockUserRepository.save.mockImplementation((u) => Promise.resolve(u));

            const updateDto = { firstName: 'Jane' };
            const result = await service.update('kc-123', updateDto);

            expect(result.firstName).toEqual('Jane');
            expect(mockUserRepository.save).toHaveBeenCalled();
        });
    });

    describe('findAll', () => {
        it('should return array of users', async () => {
            mockUserRepository.find.mockResolvedValue([mockUser]);
            const users = await service.findAll();
            expect(users).toHaveLength(1);
            expect(mockUserRepository.find).toHaveBeenCalled();
        });
    });

    describe('delete', () => {
        it('should remove the user', async () => {
            mockUserRepository.findOne.mockResolvedValue(mockUser);
            mockUserRepository.remove.mockResolvedValue(mockUser);

            await service.delete('kc-123');

            expect(mockUserRepository.remove).toHaveBeenCalledWith(mockUser);
        });
    });
});

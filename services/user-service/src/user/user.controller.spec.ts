import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

const mockUserService = {
    findOrCreate: jest.fn(),
    findByKeycloakId: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    findAll: jest.fn(),
    delete: jest.fn(),
};

const mockUser = {
    id: 'u-123',
    keycloakId: 'kc-123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
};

const mockReq = {
    user: {
        userId: 'kc-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
    },
};

describe('UserController', () => {
    let controller: UserController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                {
                    provide: UserService,
                    useValue: mockUserService,
                },
            ],
        }).compile();

        controller = module.get<UserController>(UserController);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('health', () => {
        it('should return health status', () => {
            expect(controller.health()).toEqual({ status: 'ok', service: 'user-service' });
        });
    });

    describe('getProfile', () => {
        it('should find or create a profile for the user in req', async () => {
            mockUserService.findOrCreate.mockResolvedValue(mockUser);
            const res = await controller.getProfile(mockReq);
            expect(mockUserService.findOrCreate).toHaveBeenCalledWith(mockReq.user);
            expect(res).toEqual(mockUser);
        });
    });

    describe('updateProfile', () => {
        it('should update the user profile', async () => {
            mockUserService.update.mockResolvedValue({ ...mockUser, firstName: 'Jane' });
            const res = await controller.updateProfile(mockReq, { firstName: 'Jane' });
            expect(mockUserService.update).toHaveBeenCalledWith('kc-123', { firstName: 'Jane' });
            expect(res.firstName).toEqual('Jane');
        });
    });

    describe('deleteAccount', () => {
        it('should remove the user profile', async () => {
            mockUserService.delete.mockResolvedValue(undefined);
            const res = await controller.deleteAccount(mockReq);
            expect(mockUserService.delete).toHaveBeenCalledWith('kc-123');
            expect(res.message).toEqual('Account deleted successfully');
        });
    });

    describe('findAll', () => {
        it('should call findAll on users service', async () => {
            mockUserService.findAll.mockResolvedValue([mockUser]);
            const res = await controller.findAll();
            expect(mockUserService.findAll).toHaveBeenCalled();
            expect(res).toHaveLength(1);
        });
    });
});

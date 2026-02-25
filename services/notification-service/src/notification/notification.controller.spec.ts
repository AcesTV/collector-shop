import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationType } from './notification.entity';

const mockNotificationService = {
    findByUser: jest.fn(),
    getUnreadCount: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    create: jest.fn(),
};

const mockReq = { user: { userId: 'u-1' } };

describe('NotificationController', () => {
    let controller: NotificationController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [NotificationController],
            providers: [{ provide: NotificationService, useValue: mockNotificationService }],
        }).compile();
        controller = module.get<NotificationController>(NotificationController);
        jest.clearAllMocks();
    });

    it('should be defined', () => { expect(controller).toBeDefined(); });

    describe('health', () => {
        it('should return health status', () => {
            expect(controller.health()).toEqual({ status: 'ok', service: 'notification-service' });
        });
    });

    describe('findMine', () => {
        it('should return user notifications', async () => {
            mockNotificationService.findByUser.mockResolvedValue(['n1']);
            const res = await controller.findMine(mockReq);
            expect(mockNotificationService.findByUser).toHaveBeenCalledWith('u-1');
        });
    });

    describe('unreadCount', () => {
        it('should return unread count', async () => {
            mockNotificationService.getUnreadCount.mockResolvedValue(5);
            const res = await controller.unreadCount(mockReq);
            expect(res).toBe(5);
        });
    });

    describe('markRead', () => {
        it('should mark one as read', async () => {
            mockNotificationService.markAsRead.mockResolvedValue('notif');
            const res = await controller.markRead(mockReq, 'n-1');
            expect(mockNotificationService.markAsRead).toHaveBeenCalledWith('n-1', 'u-1');
        });
    });

    describe('markAllRead', () => {
        it('should mark all as read', async () => {
            mockNotificationService.markAllAsRead.mockResolvedValue(undefined);
            await controller.markAllRead(mockReq);
            expect(mockNotificationService.markAllAsRead).toHaveBeenCalledWith('u-1');
        });
    });

    describe('create', () => {
        it('should create a notification', async () => {
            mockNotificationService.create.mockResolvedValue('notif');
            const body = { userId: 'u-1', type: NotificationType.SYSTEM, title: 'T', message: 'M' };
            const res = await controller.create(body);
            expect(mockNotificationService.create).toHaveBeenCalledWith(body);
        });
    });
});

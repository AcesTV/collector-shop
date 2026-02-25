import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotificationService } from './notification.service';
import { Notification, NotificationType } from './notification.entity';
import { EmailService } from './email.service';

const mockNotification = {
    id: 'n-1',
    userId: 'u-1',
    type: NotificationType.ORDER_UPDATE,
    title: 'Order Shipped',
    message: 'Your order has been shipped',
    isRead: false,
    emailSent: false,
    referenceId: 'o-1',
    createdAt: new Date(),
};

const mockNotifRepo = {
    create: jest.fn().mockReturnValue(mockNotification),
    save: jest.fn().mockResolvedValue(mockNotification),
    find: jest.fn().mockResolvedValue([mockNotification]),
    findOne: jest.fn().mockResolvedValue(mockNotification),
    update: jest.fn().mockResolvedValue(undefined),
    count: jest.fn().mockResolvedValue(3),
};

const mockEmailService = {
    sendEmail: jest.fn().mockResolvedValue(undefined),
};

describe('NotificationService', () => {
    let service: NotificationService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NotificationService,
                { provide: getRepositoryToken(Notification), useValue: mockNotifRepo },
                { provide: EmailService, useValue: mockEmailService },
            ],
        }).compile();
        service = module.get<NotificationService>(NotificationService);
        jest.clearAllMocks();
    });

    it('should be defined', () => { expect(service).toBeDefined(); });

    describe('create', () => {
        it('should create a notification without email', async () => {
            mockNotifRepo.create.mockReturnValue(mockNotification);
            mockNotifRepo.save.mockResolvedValue(mockNotification);
            const result = await service.create({
                userId: 'u-1', type: NotificationType.ORDER_UPDATE,
                title: 'Test', message: 'Msg',
            });
            expect(mockNotifRepo.save).toHaveBeenCalled();
            expect(mockEmailService.sendEmail).not.toHaveBeenCalled();
        });

        it('should create a notification with email', async () => {
            mockNotifRepo.create.mockReturnValue({ ...mockNotification });
            mockNotifRepo.save.mockResolvedValue({ ...mockNotification, emailSent: true });
            const result = await service.create({
                userId: 'u-1', type: NotificationType.ORDER_UPDATE,
                title: 'Test', message: 'Msg', email: 'a@b.com', sendEmail: true,
            });
            expect(mockEmailService.sendEmail).toHaveBeenCalledWith('a@b.com', expect.any(String), expect.any(String));
        });
    });

    describe('findByUser', () => {
        it('should return user notifications', async () => {
            const result = await service.findByUser('u-1');
            expect(mockNotifRepo.find).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: 'u-1' } }));
            expect(result).toHaveLength(1);
        });
    });

    describe('markAsRead', () => {
        it('should mark notification as read', async () => {
            mockNotifRepo.findOne.mockResolvedValue({ ...mockNotification });
            mockNotifRepo.save.mockResolvedValue({ ...mockNotification, isRead: true });
            const result = await service.markAsRead('n-1', 'u-1');
            expect(mockNotifRepo.save).toHaveBeenCalled();
        });

        it('should throw if not found', async () => {
            mockNotifRepo.findOne.mockResolvedValue(null);
            await expect(service.markAsRead('n-99', 'u-1')).rejects.toThrow();
        });
    });

    describe('markAllAsRead', () => {
        it('should update all unread notifications', async () => {
            await service.markAllAsRead('u-1');
            expect(mockNotifRepo.update).toHaveBeenCalledWith({ userId: 'u-1', isRead: false }, { isRead: true });
        });
    });

    describe('getUnreadCount', () => {
        it('should return unread count', async () => {
            const result = await service.getUnreadCount('u-1');
            expect(result).toBe(3);
        });
    });
});

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './notification.entity';
import { EmailService } from './email.service';

@Injectable()
export class NotificationService {
    constructor(
        @InjectRepository(Notification)
        private readonly notifRepo: Repository<Notification>,
        private readonly emailService: EmailService,
    ) { }

    async create(data: {
        userId: string;
        email?: string;
        type: NotificationType;
        title: string;
        message: string;
        referenceId?: string;
        sendEmail?: boolean;
    }): Promise<Notification> {
        const notif = this.notifRepo.create({
            userId: data.userId,
            type: data.type,
            title: data.title,
            message: data.message,
            referenceId: data.referenceId,
        });

        const saved = await this.notifRepo.save(notif);

        // Envoi email si demandé
        if (data.sendEmail && data.email) {
            await this.emailService.sendEmail(
                data.email,
                `Collector Shop - ${data.title}`,
                `<h2>${data.title}</h2><p>${data.message}</p>`,
            );
            saved.emailSent = true;
            await this.notifRepo.save(saved);
        }

        return saved;
    }

    async findByUser(userId: string): Promise<Notification[]> {
        return this.notifRepo.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: 50,
        });
    }

    async markAsRead(id: string, userId: string): Promise<Notification> {
        const notif = await this.notifRepo.findOne({ where: { id, userId } });
        if (!notif) throw new Error('Notification not found');
        notif.isRead = true;
        return this.notifRepo.save(notif);
    }

    async markAllAsRead(userId: string): Promise<void> {
        await this.notifRepo.update({ userId, isRead: false }, { isRead: true });
    }

    async getUnreadCount(userId: string): Promise<number> {
        return this.notifRepo.count({ where: { userId, isRead: false } });
    }
}

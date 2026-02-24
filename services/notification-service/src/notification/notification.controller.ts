import { Controller, Get, Post, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationType } from './notification.entity';
import { KeycloakGuard } from '../auth/keycloak.guard';

@Controller()
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }

    @Get('health')
    health() { return { status: 'ok', service: 'notification-service' }; }

    @Get('mine')
    @UseGuards(KeycloakGuard)
    findMine(@Req() req: any) {
        return this.notificationService.findByUser(req.user.userId);
    }

    @Get('unread-count')
    @UseGuards(KeycloakGuard)
    unreadCount(@Req() req: any) {
        return this.notificationService.getUnreadCount(req.user.userId);
    }

    @Patch(':id/read')
    @UseGuards(KeycloakGuard)
    markRead(@Req() req: any, @Param('id') id: string) {
        return this.notificationService.markAsRead(id, req.user.userId);
    }

    @Patch('read-all')
    @UseGuards(KeycloakGuard)
    markAllRead(@Req() req: any) {
        return this.notificationService.markAllAsRead(req.user.userId);
    }

    // Internal: create notification (called by other services)
    @Post()
    create(@Body() body: { userId: string; email?: string; type: NotificationType; title: string; message: string; referenceId?: string; sendEmail?: boolean }) {
        return this.notificationService.create(body);
    }
}

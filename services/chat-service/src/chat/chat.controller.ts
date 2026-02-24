import { Controller, Get, Post, Patch, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ChatService } from './chat.service';
import { KeycloakGuard } from '../auth/keycloak.guard';

@Controller()
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Get('health')
    health() { return { status: 'ok', service: 'chat-service' }; }

    @Get('conversations')
    @UseGuards(KeycloakGuard)
    getConversations(@Req() req: any) {
        return this.chatService.getUserConversations(req.user.userId);
    }

    @Post('conversations')
    @UseGuards(KeycloakGuard)
    createConversation(@Req() req: any, @Body() body: { sellerId: string; productId?: string }) {
        return this.chatService.getOrCreateConversation(req.user.userId, body.sellerId, body.productId);
    }

    @Get('conversations/:id/messages')
    @UseGuards(KeycloakGuard)
    getMessages(@Param('id') id: string) {
        return this.chatService.getMessages(id);
    }

    @Patch('messages/:id/moderate')
    @UseGuards(KeycloakGuard)
    moderate(@Param('id') id: string) {
        return this.chatService.moderateMessage(id);
    }
}

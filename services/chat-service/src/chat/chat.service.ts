import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';
import { Conversation } from './conversation.entity';

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(Message) private readonly messageRepo: Repository<Message>,
        @InjectRepository(Conversation) private readonly convRepo: Repository<Conversation>,
    ) { }

    async getOrCreateConversation(buyerId: string, sellerId: string, productId?: string): Promise<Conversation> {
        let conv = await this.convRepo.findOne({ where: { buyerId, sellerId } });
        if (!conv) {
            conv = this.convRepo.create({ buyerId, sellerId, productId });
            await this.convRepo.save(conv);
        }
        return conv;
    }

    async sendMessage(conversationId: string, senderId: string, content: string): Promise<Message> {
        const message = this.messageRepo.create({ conversationId, senderId, content });
        return this.messageRepo.save(message);
    }

    async getMessages(conversationId: string, limit = 50): Promise<Message[]> {
        return this.messageRepo.find({
            where: { conversationId },
            order: { createdAt: 'ASC' },
            take: limit,
        });
    }

    async getUserConversations(userId: string): Promise<Conversation[]> {
        return this.convRepo.find({
            where: [{ buyerId: userId }, { sellerId: userId }],
            order: { createdAt: 'DESC' },
        });
    }

    async moderateMessage(messageId: string): Promise<Message> {
        const msg = await this.messageRepo.findOne({ where: { id: messageId } });
        if (msg) {
            msg.isModerated = true;
            msg.content = '[Message modéré par l\'admin]';
            await this.messageRepo.save(msg);
        }
        return msg!;
    }
}

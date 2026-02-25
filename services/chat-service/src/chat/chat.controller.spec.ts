import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

const mockChatService = {
    getUserConversations: jest.fn(),
    getOrCreateConversation: jest.fn(),
    getMessages: jest.fn(),
    moderateMessage: jest.fn(),
};

const mockReq = { user: { userId: 'u-1' } };

describe('ChatController', () => {
    let controller: ChatController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ChatController],
            providers: [{ provide: ChatService, useValue: mockChatService }],
        }).compile();
        controller = module.get<ChatController>(ChatController);
        jest.clearAllMocks();
    });

    it('should be defined', () => { expect(controller).toBeDefined(); });

    describe('health', () => {
        it('should return health status', () => {
            expect(controller.health()).toEqual({ status: 'ok', service: 'chat-service' });
        });
    });

    describe('getConversations', () => {
        it('should return user conversations', async () => {
            mockChatService.getUserConversations.mockResolvedValue(['conv']);
            const res = await controller.getConversations(mockReq);
            expect(mockChatService.getUserConversations).toHaveBeenCalledWith('u-1');
        });
    });

    describe('createConversation', () => {
        it('should create or get conversation', async () => {
            mockChatService.getOrCreateConversation.mockResolvedValue('conv');
            const res = await controller.createConversation(mockReq, { sellerId: 's-1', productId: 'p-1' });
            expect(mockChatService.getOrCreateConversation).toHaveBeenCalledWith('u-1', 's-1', 'p-1');
        });
    });

    describe('getMessages', () => {
        it('should return messages', async () => {
            mockChatService.getMessages.mockResolvedValue(['msg']);
            const res = await controller.getMessages('conv-1');
            expect(mockChatService.getMessages).toHaveBeenCalledWith('conv-1');
        });
    });

    describe('moderate', () => {
        it('should moderate a message', async () => {
            mockChatService.moderateMessage.mockResolvedValue('msg');
            const res = await controller.moderate('msg-1');
            expect(mockChatService.moderateMessage).toHaveBeenCalledWith('msg-1');
        });
    });
});

import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

const mockChatService = {
    sendMessage: jest.fn(),
};

describe('ChatGateway', () => {
    let gateway: ChatGateway;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChatGateway,
                { provide: ChatService, useValue: mockChatService },
            ],
        }).compile();
        gateway = module.get<ChatGateway>(ChatGateway);
        // Mock the server
        gateway.server = { to: jest.fn().mockReturnValue({ emit: jest.fn() }) } as any;
        jest.clearAllMocks();
    });

    it('should be defined', () => { expect(gateway).toBeDefined(); });

    describe('handleConnection', () => {
        it('should log connection', () => {
            const client = { id: 'client-1' } as any;
            expect(() => gateway.handleConnection(client)).not.toThrow();
        });
    });

    describe('handleDisconnect', () => {
        it('should log disconnection', () => {
            const client = { id: 'client-1' } as any;
            expect(() => gateway.handleDisconnect(client)).not.toThrow();
        });
    });

    describe('handleJoin', () => {
        it('should join a conversation room', () => {
            const client = { id: 'c-1', join: jest.fn() } as any;
            gateway.handleJoin(client, { conversationId: 'conv-1' });
            expect(client.join).toHaveBeenCalledWith('conv-1');
        });
    });

    describe('handleMessage', () => {
        it('should send and broadcast message', async () => {
            const client = { id: 'c-1' } as any;
            const mockMessage = { id: 'msg-1', content: 'Hi' };
            mockChatService.sendMessage.mockResolvedValue(mockMessage);
            gateway.server = { to: jest.fn().mockReturnValue({ emit: jest.fn() }) } as any;

            const result = await gateway.handleMessage(client, {
                conversationId: 'conv-1', senderId: 'u-1', content: 'Hi',
            });
            expect(mockChatService.sendMessage).toHaveBeenCalledWith('conv-1', 'u-1', 'Hi');
            expect(gateway.server.to).toHaveBeenCalledWith('conv-1');
            expect(result).toEqual(mockMessage);
        });
    });

    describe('handleLeave', () => {
        it('should leave a conversation room', () => {
            const client = { id: 'c-1', leave: jest.fn() } as any;
            gateway.handleLeave(client, { conversationId: 'conv-1' });
            expect(client.leave).toHaveBeenCalledWith('conv-1');
        });
    });
});

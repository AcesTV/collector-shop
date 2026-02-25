import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { Message } from './message.entity';
import { Conversation } from './conversation.entity';

const mockConv = {
    id: 'conv-1', buyerId: 'b-1', sellerId: 's-1',
    productId: 'p-1', isActive: true, createdAt: new Date(),
};

const mockMsg = {
    id: 'msg-1', conversationId: 'conv-1', senderId: 'b-1',
    content: 'Hello', isRead: false, isModerated: false, createdAt: new Date(),
};

const mockMessageRepo = {
    create: jest.fn().mockReturnValue(mockMsg),
    save: jest.fn().mockResolvedValue(mockMsg),
    find: jest.fn().mockResolvedValue([mockMsg]),
    findOne: jest.fn().mockResolvedValue(mockMsg),
};

const mockConvRepo = {
    create: jest.fn().mockReturnValue(mockConv),
    save: jest.fn().mockResolvedValue(mockConv),
    find: jest.fn().mockResolvedValue([mockConv]),
    findOne: jest.fn(),
};

describe('ChatService', () => {
    let service: ChatService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChatService,
                { provide: getRepositoryToken(Message), useValue: mockMessageRepo },
                { provide: getRepositoryToken(Conversation), useValue: mockConvRepo },
            ],
        }).compile();
        service = module.get<ChatService>(ChatService);
        jest.clearAllMocks();
    });

    it('should be defined', () => { expect(service).toBeDefined(); });

    describe('getOrCreateConversation', () => {
        it('should return existing conversation', async () => {
            mockConvRepo.findOne.mockResolvedValue(mockConv);
            const res = await service.getOrCreateConversation('b-1', 's-1');
            expect(res).toEqual(mockConv);
            expect(mockConvRepo.save).not.toHaveBeenCalled();
        });

        it('should create new conversation if none exists', async () => {
            mockConvRepo.findOne.mockResolvedValue(null);
            mockConvRepo.create.mockReturnValue(mockConv);
            mockConvRepo.save.mockResolvedValue(mockConv);
            const res = await service.getOrCreateConversation('b-1', 's-1', 'p-1');
            expect(mockConvRepo.create).toHaveBeenCalled();
            expect(mockConvRepo.save).toHaveBeenCalled();
        });
    });

    describe('sendMessage', () => {
        it('should create and save a message', async () => {
            const res = await service.sendMessage('conv-1', 'b-1', 'Hello');
            expect(mockMessageRepo.create).toHaveBeenCalledWith({ conversationId: 'conv-1', senderId: 'b-1', content: 'Hello' });
            expect(mockMessageRepo.save).toHaveBeenCalled();
        });
    });

    describe('getMessages', () => {
        it('should return messages for conversation', async () => {
            const res = await service.getMessages('conv-1');
            expect(mockMessageRepo.find).toHaveBeenCalledWith(expect.objectContaining({ where: { conversationId: 'conv-1' } }));
            expect(res).toHaveLength(1);
        });
    });

    describe('getUserConversations', () => {
        it('should return conversations for user', async () => {
            const res = await service.getUserConversations('b-1');
            expect(mockConvRepo.find).toHaveBeenCalled();
            expect(res).toHaveLength(1);
        });
    });

    describe('moderateMessage', () => {
        it('should moderate a message', async () => {
            mockMessageRepo.findOne.mockResolvedValue({ ...mockMsg });
            mockMessageRepo.save.mockResolvedValue({ ...mockMsg, isModerated: true });
            const res = await service.moderateMessage('msg-1');
            expect(mockMessageRepo.save).toHaveBeenCalled();
        });
    });
});

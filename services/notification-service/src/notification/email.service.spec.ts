import { EmailService } from './email.service';

// Mock nodemailer
jest.mock('nodemailer', () => ({
    createTransport: jest.fn().mockReturnValue({
        sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' }),
    }),
}));

describe('EmailService', () => {
    let service: EmailService;

    beforeEach(() => {
        service = new EmailService();
    });

    it('should be defined', () => { expect(service).toBeDefined(); });

    describe('sendEmail', () => {
        it('should send email without throwing', async () => {
            await expect(service.sendEmail('to@test.com', 'Subject', '<p>Body</p>')).resolves.not.toThrow();
        });

        it('should handle errors gracefully', async () => {
            // Override mock to throw
            const nodemailer = require('nodemailer');
            nodemailer.createTransport.mockReturnValueOnce({
                sendMail: jest.fn().mockRejectedValue(new Error('SMTP error')),
            });
            const failService = new EmailService();
            // Should not throw even on error (it logs it)
            await expect(failService.sendEmail('to@test.com', 'Sub', '<p>B</p>')).resolves.not.toThrow();
        });
    });
});

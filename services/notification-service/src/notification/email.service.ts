import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private readonly transporter: nodemailer.Transporter;

    constructor() {
        // Utilise Ethereal pour le POC (emails de test)
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.ethereal.email',
            port: Number.parseInt(process.env.SMTP_PORT || '587'),
            auth: {
                user: process.env.SMTP_USER || 'test@ethereal.email',
                pass: process.env.SMTP_PASS || 'test',
            },
        });
    }

    async sendEmail(to: string, subject: string, html: string): Promise<void> {
        try {
            const info = await this.transporter.sendMail({
                from: '"Collector Shop" <noreply@collector.shop>',
                to,
                subject,
                html,
            });
            this.logger.log(`📧 Email sent: ${info.messageId}`);
        } catch (error) {
            this.logger.error(`Failed to send email to ${to}`, error);
        }
    }
}

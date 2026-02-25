import { BadRequestException } from '@nestjs/common';
import { ContentFilterService } from './content-filter.service';

describe('ContentFilterService', () => {
    let service: ContentFilterService;

    beforeEach(() => {
        service = new ContentFilterService();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    // ── detectPersonalInfo() ───────────────────────────────
    describe('detectPersonalInfo()', () => {
        it('should detect email addresses', () => {
            const violations = service.detectPersonalInfo('Envoyez à test@gmail.com');
            expect(violations).toContain('Email détecté');
        });

        it('should detect French phone numbers (06 format)', () => {
            const violations = service.detectPersonalInfo('Appelez le 06 12 34 56 78');
            expect(violations.some((v) => v.includes('téléphone'))).toBe(true);
        });

        it('should detect French phone numbers (+33 format)', () => {
            const violations = service.detectPersonalInfo('Tel: +33 6 12 34 56 78');
            expect(violations.some((v) => v.includes('téléphone'))).toBe(true);
        });

        it('should detect URLs', () => {
            const violations = service.detectPersonalInfo('Visitez https://mon-site.fr');
            expect(violations).toContain('URL détectée');
        });

        it('should detect social media handles', () => {
            const violations = service.detectPersonalInfo('Mon insta @collector_vintage');
            expect(violations).toContain('Identifiant réseau social détecté');
        });

        it('should return empty array for clean text', () => {
            const violations = service.detectPersonalInfo(
                'Figurine Star Wars originale en excellent état',
            );
            expect(violations).toHaveLength(0);
        });

        it('should detect multiple violations at once', () => {
            const violations = service.detectPersonalInfo(
                'Contact: test@mail.com ou 06 12 34 56 78 ou https://facebook.com',
            );
            expect(violations.length).toBeGreaterThanOrEqual(2);
        });
    });

    // ── validateContent() ──────────────────────────────────
    describe('validateContent()', () => {
        it('should not throw for clean content', () => {
            expect(() =>
                service.validateContent('Belle figurine en bon état', 'description'),
            ).not.toThrow();
        });

        it('should throw BadRequestException when email is found', () => {
            expect(() =>
                service.validateContent('Contactez seller@outlook.com', 'description'),
            ).toThrow(BadRequestException);
        });

        it('should include the field name in the error message', () => {
            try {
                service.validateContent('Appelez le 06 12 34 56 78', 'titre');
                fail('Should have thrown');
            } catch (e: any) {
                expect(e.message).toContain('titre');
            }
        });

        it('should mention that personal info is forbidden', () => {
            try {
                service.validateContent('Mon insta @vendeur_pro', 'description');
                fail('Should have thrown');
            } catch (e: any) {
                expect(e.message).toContain('informations personnelles interdites');
            }
        });
    });
});

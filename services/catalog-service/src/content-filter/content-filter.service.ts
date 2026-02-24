import { Injectable, BadRequestException } from '@nestjs/common';

/**
 * Service de filtrage de contenu pour empêcher le partage
 * d'informations personnelles (email, téléphone, etc.)
 * dans les descriptions de produits et les messages.
 */
@Injectable()
export class ContentFilterService {
    private readonly patterns = [
        // Email
        /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,
        // Phone (FR formats)
        /(?:(?:\+|00)33[\s.-]?|0)[1-9](?:[\s.-]?\d{2}){4}/gi,
        // Phone (international)
        /\+?\d{1,4}[\s.-]?\(?\d{1,4}\)?[\s.-]?\d{1,4}[\s.-]?\d{1,9}/gi,
        // URLs
        /https?:\/\/[^\s]+/gi,
        // Social media handles
        /@[a-zA-Z0-9_]{1,30}/gi,
    ];

    /**
     * Check if text contains personal information
     * @returns Array of detected violations
     */
    detectPersonalInfo(text: string): string[] {
        const violations: string[] = [];

        if (this.patterns[0].test(text)) violations.push('Email détecté');
        this.patterns[0].lastIndex = 0;

        if (this.patterns[1].test(text) || this.patterns[2].test(text)) {
            violations.push('Numéro de téléphone détecté');
        }
        this.patterns[1].lastIndex = 0;
        this.patterns[2].lastIndex = 0;

        if (this.patterns[3].test(text)) violations.push('URL détectée');
        this.patterns[3].lastIndex = 0;

        if (this.patterns[4].test(text)) violations.push('Identifiant réseau social détecté');
        this.patterns[4].lastIndex = 0;

        return violations;
    }

    /**
     * Validate content and throw if personal info is found
     */
    validateContent(text: string, fieldName: string): void {
        const violations = this.detectPersonalInfo(text);
        if (violations.length > 0) {
            throw new BadRequestException(
                `Le champ "${fieldName}" contient des informations personnelles interdites: ${violations.join(', ')}. ` +
                `Les échanges d'informations personnelles sont proscrits sur Collector.shop.`,
            );
        }
    }
}

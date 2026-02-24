import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import * as jwksRsa from 'jwks-rsa';

@Injectable()
export class KeycloakStrategy extends PassportStrategy(Strategy, 'keycloak') {
    constructor() {
        const keycloakUrl = process.env.KEYCLOAK_URL || 'http://localhost:8080';
        const realm = process.env.KEYCLOAK_REALM || 'collector';

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            audience: 'account',
            issuer: `${keycloakUrl}/realms/${realm}`,
            algorithms: ['RS256'],
            secretOrKeyProvider: jwksRsa.passportJwtSecret({
                cache: true,
                rateLimit: true,
                jwksRequestsPerMinute: 10,
                jwksUri: `${keycloakUrl}/realms/${realm}/protocol/openid-connect/certs`,
            }),
        });
    }

    async validate(payload: any) {
        return {
            userId: payload.sub,
            email: payload.email,
            firstName: payload.given_name,
            lastName: payload.family_name,
            roles: payload.realm_access?.roles || [],
        };
    }
}

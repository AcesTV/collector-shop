import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from './user/user.module';
import { KeycloakStrategy } from './auth/keycloak.strategy';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.DB_HOST || 'localhost',
            port: Number.parseInt(process.env.DB_PORT || '5432'),
            username: process.env.DB_USER || 'collector',
            password: process.env.DB_PASSWORD || 'collector_secret_2025',
            database: process.env.DB_NAME || 'collectorshop',
            schema: process.env.DB_SCHEMA || 'user_service',
            autoLoadEntities: true,
            synchronize: true, // DEV only - creates tables automatically
        }),
        PassportModule.register({ defaultStrategy: 'keycloak' }),
        UserModule,
    ],
    providers: [KeycloakStrategy],
})
export class AppModule { }

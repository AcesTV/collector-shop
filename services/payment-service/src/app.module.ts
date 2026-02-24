import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { PaymentModule } from './payment/payment.module';
import { KeycloakStrategy } from './auth/keycloak.strategy';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432'),
            username: process.env.DB_USER || 'collector',
            password: process.env.DB_PASSWORD || 'collector_secret_2025',
            database: process.env.DB_NAME || 'collectorshop',
            schema: process.env.DB_SCHEMA || 'payment_service',
            autoLoadEntities: true,
            synchronize: process.env.NODE_ENV === 'development',
        }),
        PassportModule.register({ defaultStrategy: 'keycloak' }),
        PaymentModule,
    ],
    providers: [KeycloakStrategy],
})
export class AppModule { }

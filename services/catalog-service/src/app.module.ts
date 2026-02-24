import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { ProductModule } from './product/product.module';
import { CategoryModule } from './category/category.module';
import { ShopModule } from './shop/shop.module';
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
            schema: process.env.DB_SCHEMA || 'catalog_service',
            autoLoadEntities: true,
            synchronize: process.env.NODE_ENV === 'development',
        }),
        PassportModule.register({ defaultStrategy: 'keycloak' }),
        ProductModule,
        CategoryModule,
        ShopModule,
    ],
    providers: [KeycloakStrategy],
})
export class AppModule { }

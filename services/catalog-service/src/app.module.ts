import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { PrometheusModule, makeHistogramProvider, makeCounterProvider } from '@willsoto/nestjs-prometheus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { ProductModule } from './product/product.module';
import { CategoryModule } from './category/category.module';
import { ShopModule } from './shop/shop.module';
import { KeycloakStrategy } from './auth/keycloak.strategy';
import { MetricsMiddleware } from './metrics.middleware';

@Module({
    imports: [
        PrometheusModule.register({
            path: '/metrics',
            defaultMetrics: {
                enabled: true,
            },
        }),
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.DB_HOST || 'localhost',
            port: Number.parseInt(process.env.DB_PORT || '5432'),
            username: process.env.DB_USER || 'collector',
            password: process.env.DB_PASSWORD || 'collector_secret_2025',
            database: process.env.DB_NAME || 'collectorshop',
            schema: process.env.DB_SCHEMA || 'catalog_service',
            autoLoadEntities: true,
            synchronize: true, // DEV only - creates tables automatically
        }),
        PassportModule.register({ defaultStrategy: 'keycloak' }),
        ProductModule,
        CategoryModule,
        ShopModule,
    ],
    providers: [
        KeycloakStrategy,
        makeHistogramProvider({
            name: 'http_request_duration_seconds',
            help: 'Duration of HTTP requests in seconds',
            labelNames: ['method', 'route', 'status_code'],
            buckets: [0.01, 0.05, 0.1, 0.5, 1, 3],
        }),
        makeCounterProvider({
            name: 'http_requests_total',
            help: 'Total number of HTTP requests',
            labelNames: ['method', 'route', 'status_code'],
        }),
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(MetricsMiddleware).forRoutes('*');
    }
}

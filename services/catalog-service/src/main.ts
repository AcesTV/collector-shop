import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.enableCors({
        origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost'],
        credentials: true,
    });

    app.useGlobalPipes(
        new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );

    const port = process.env.PORT || 3002;
    await app.listen(port);
    console.log(`📦 Catalog Service running on port ${port}`);
}

bootstrap().catch((err) => {
    console.error('Error during bootstrap:', err);
    process.exit(1);
}); // NOSONAR

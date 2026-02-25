import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Counter, Histogram } from 'prom-client';
import { InjectMetric } from '@willsoto/nestjs-prometheus';

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
    constructor(
        @InjectMetric('http_request_duration_seconds')
        private readonly requestDurationHistogram: Histogram<string>,
        @InjectMetric('http_requests_total')
        private readonly requestCounter: Counter<string>,
    ) { }

    use(req: Request, res: Response, next: NextFunction) {
        const method = req.method;
        const path = req.path;

        if (path === '/metrics') {
            return next();
        }

        const endTimer = this.requestDurationHistogram.startTimer();

        res.on('finish', () => {
            const status = res.statusCode;
            const finalRoute = (req.route && req.route.path) ? req.route.path : path;

            this.requestCounter.inc({ method, route: finalRoute, status_code: status });
            endTimer({ method, route: finalRoute, status_code: status });
        });

        next();
    }
}

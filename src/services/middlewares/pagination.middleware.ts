// pagination.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';

@Injectable()
export class PaginationMiddleware implements NestMiddleware {
    use(req: any, res: Response, next: NextFunction) {
        const { page, perPage } = req.query;
        if (page !== undefined && perPage !== undefined) {
            req.pagination = { page: +page, perPage: +perPage };
        }
        next();
    }
}

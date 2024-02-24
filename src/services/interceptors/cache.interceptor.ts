import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
    constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) { }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();
        const method: string = request.method;
        const cacheKey: string = this.getCacheKey(request);

        if (method === 'GET' && request.url.split('/').length == 2)
            return await this.handleGetRequest(cacheKey, next);
        return next.handle().pipe(
            tap(data => {
                if (data && ['DELETE', 'PATCH'].some(x => x === method))
                    this.cacheManager.del(cacheKey)
            }),
        );
    }

    private async handleGetRequest(cacheKey: string, next: CallHandler): Promise<Observable<any>> {
        const cachedData = await this.cacheManager.get(cacheKey);
        if (cachedData) {
            this.cacheManager.set(cacheKey, cachedData, 60000);
            return new Observable(observer => {
                observer.next(cachedData);
                observer.complete();
            });
        }

        return next.handle().pipe(
            tap(data => {
                if (data)
                    this.cacheManager.set(cacheKey, data, 60000);
            }),
        );
    }

    private getCacheKey(request: any): string {
        return `${request.url.split('/')[1]}`;
    }
}

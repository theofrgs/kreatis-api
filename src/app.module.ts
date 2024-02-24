import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { JwtModule } from '@nestjs/jwt';
import * as path from 'path';

import { HashService } from './services/hash/hash.service';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { HealthController } from './health.controller';
import { CacheInterceptor } from './services/interceptors/cache.interceptor';
import { PaginationMiddleware } from './services/middlewares/pagination.middleware';
import { UserModule } from './user/user.module';
import { SeedService } from './services/seed/seed.service';
import { TransactionService } from './transaction/transaction.service';
import { User } from './user/entities/user.entity';
import { CredentialModule } from './credential/credential.module';
import { NativeCredentialModule } from './native-credential/native-credential.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './services/guards/auth.guard';

@Module({
  imports: [
    // CacheModule.registerAsync({
    //   isGlobal: true,
    //   useFactory: async () => ({
    //     store: await redisStore({
    //       url: `redis://:${process.env.REDIS_PASSWORD}@${
    //         process.env.NODE_ENV === 'test'
    //           ? 'localhost'
    //           : process.env.REDIS_HOST
    //       }:6379`,
    //     }),
    //   }),
    // }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 10,
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(
      process.env.NODE_ENV && process.env.NODE_ENV === 'test'
        ? {
            type: 'sqlite',
            database: ':memory:',
            entities: ['../**/*.entity.ts'],
            synchronize: true,
            logging: false,
          }
        : {
            type: 'mariadb',
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT),
            username: process.env.DB_INIT_ROOT_USER,
            password: process.env.DB_INIT_ROOT_PASSWORD,
            database: process.env.DB_NAME,
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true,
          },
    ),
    // TODO fix with auth service where jwt use
    JwtModule.register({
      global: true,
      secret: process.env.API_JWT_SECRET,
      signOptions: { expiresIn: '6000h' },
    }),
    UserModule,
    CredentialModule,
    NativeCredentialModule,
    AuthModule,
  ],
  controllers: [HealthController],
  providers: [
    HashService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: CacheInterceptor,
    // },
    SeedService,
    TransactionService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PaginationMiddleware).forRoutes('*');
  }
}

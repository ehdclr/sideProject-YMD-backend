import * as redisStore from 'cache-manager-redis-store';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerMiddleware } from './commons/logger/logger.middleware';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './apis/users/users.module';
import { AuthModule } from './apis/auth/auth.module';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisClientOptions } from 'redis';
import { BoardsModule } from './apis/boards/boards.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: process.env.DATABASE_DEV_TYPE as 'postgres',
      host: process.env.DATABASE_DEV_HOST,
      port: Number(process.env.DATABASE_DEV_PORT),
      username: process.env.DATABASE_DEV_USERNAME,
      password: process.env.DATABASE_DEV_PASSWORD,
      database: process.env.DATABASE_DEV_DATABASE,
      entities: [__dirname + '/apis/**/*.entity.*'],
      synchronize: true,
      logging: true,
    }),
    CacheModule.register<RedisClientOptions>({
      store: redisStore,
      url: `redis://${process.env.REDIS_HOST}:6379`, //localhost용
      isGlobal: true,
      ttl: 60 * 60 * 24 * 14, // 전역 ttl 기본 설정
    }),
    UsersModule,
    AuthModule,
    BoardsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}

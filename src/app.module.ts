import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { LoggerMiddleware } from './commons/logger/logger.middleware';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './apis/users/users.module';

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
      entities: [__dirname + '/../**/*.entity.{js.ts}'],
      synchronize: true,
      logging: true,
    }),
    UsersModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}

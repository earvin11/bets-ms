import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { RedisModule } from './redis/infraestructure/redis.module';
import { envs } from './config/envs';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: envs.redisHost,
        port: envs.redisPort,
        password: envs.redisPassword,
      },
    }),
    RedisModule,
  ],
  controllers: [AppController],
})
export class AppModule {}

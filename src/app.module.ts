import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { OrderModule } from './order/order.module';
import { CatalogueModule } from './catalogue/catalogue.module';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
    OrderModule,
    CatalogueModule,
    CacheModule.register({
      isGlobal: true,
      store: new KeyvRedis('redis://localhost:6379'),
    }),
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import {BullModule} from '@nestjs/bullmq';
import { OrderModule } from './order/order.module';


@Module({
  imports: [BullModule.forRoot({
    connection: {
      host: 'localhost',
      port: 6379,
    },
  }),
    OrderModule,
  ],
})
export class AppModule {}

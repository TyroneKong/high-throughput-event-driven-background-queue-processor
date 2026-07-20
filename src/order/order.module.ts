import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { BullModule } from '@nestjs/bullmq';
import { OrderProcessor } from './order.processor';
import { OrderEventsListener } from './dto/order.events';
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'order-processing',
    }),
  ],
  providers: [OrderProcessor, OrderEventsListener],
  controllers: [OrderController],
})
export class OrderModule {}

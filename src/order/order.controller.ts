// src/order/order.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrderController {
  constructor(
    // Inject our registered named queue channel
    @InjectQueue('order-processing') private readonly orderQueue: Queue,
  ) {}

  @Post()
  async createOrder(@Body() dto: CreateOrderDto) {
    console.log(`📥 API Received order request for: ${dto.customerEmail}`);

    // 1. Hand the payload over to the Redis queue as a named job ("process-checkout")
    // This takes less than 2 milliseconds.
    const job = await this.orderQueue.add('process-checkout', dto, {
      attempts: 3, // If the job fails, retry automatically up to 3 times
      backoff: {
        type: 'exponential',
        delay: 5000, // Wait 5s before first retry, then 10s, then 20s...
      },
    });

    // 2. Return an instant success acknowledgment to the client along with the Job ID
    return {
      success: true,
      message: 'Order received and is processing in the background.',
      jobId: job.id,
    };
  }
}

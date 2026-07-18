// src/order/order.processor.ts
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CreateOrderDto } from './dto/create-order.dto';

// 1. Tell BullMQ this class belongs to the specific 'order-processing' queue channel
@Processor('order-processing')
export class OrderProcessor extends WorkerHost {
  
  // 2. The core framework method that executes when a job is picked up out of Redis
  async process(job: Job<CreateOrderDto, any, string>): Promise<any> {
    console.log(`🤖 Worker picked up Job ID [${job.id}] for: ${job.data.customerEmail}`);
    
    // Check the specific job type we dispatched from our controller
    if (job.name === 'process-checkout') {
      const { customerEmail, items, totalPrice } = job.data;
      
      // --- Simulating Heavy Async Operations ---
      
      // Step A: Payment Gateway Settlement Latency
      console.log(`⏳ [Job ${job.id}] Settling $${totalPrice} transaction authorization...`);
      await this.sleep(2000); 
      
      // Step B: PDF Invoice Generation & Cold Storage Upload
      console.log(`⏳ [Job ${job.id}] Generating manifest and layout structures for ${items.length} items...`);
      await this.sleep(1500);

      console.log(`✅ [Job ${job.id}] Processing complete! Dispatched confirmation to ${customerEmail}.`);
      
      return { status: 'COMPLETED', processedAt: new Date() };
    }
  }

  // Small utility method to mock actual network or operation I/O delay times
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

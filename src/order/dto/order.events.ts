// src/order/order.events.ts
import { QueueEventsHost, QueueEventsListener, OnQueueEvent } from '@nestjs/bullmq';

// Bind this listener directly to the same 'order-processing' queue channel
@QueueEventsListener('order-processing')
export class OrderEventsListener extends QueueEventsHost {

  @OnQueueEvent('completed')
  onCompleted({ jobId, returnvalue }: { jobId: string; returnvalue: string }) {
    console.log(`📈 [Global Telemetry] Job ID [${jobId}] completed successfully! Worker returned:`, returnvalue);
  }

  @OnQueueEvent('failed')
  onFailed({ jobId, failedReason }: { jobId: string; failedReason: string }) {
    console.warn(`🚨 [Global Telemetry] Job ID [${jobId}] FAILED. Reason: ${failedReason}`);
    
  }
}

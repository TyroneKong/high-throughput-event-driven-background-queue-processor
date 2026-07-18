# High-Throughput Event-Driven Background Queue Processor

A robust, enterprise-grade asynchronous task processing architecture built with NestJS, BullMQ, and Redis. This project serves as a technical sandbox demonstrating how to decouple high-latency or resource-intensive business logic from the synchronous HTTP request-response lifecycle, guaranteeing microsecond response times and bulletproof system resiliency.

---

## 📈 Architecture Overview & Design Topology

In standard synchronous REST APIs, expensive tasks like payment reconciliation, third-party webhook ingestions, or PDF manifest generation block the runtime thread and keep client connections hanging. This system implements a **Message Queue / Worker Pattern** to absorb incoming traffic spikes, level resource demand, and ensure reliable execution via automatic backoff matrices.

```
       [ HTTP Client Request ]
                  │  (e.g., POST /orders - Inbound Payload)
                  ▼
   ┌──────────────────────────────┐
   │       OrderController        │  <-- Route Handler
   └──────────────┬───────────────┘
                  │  (Pushes Named Job payload to Redis in < 2ms)
                  ▼
   ┌──────────────────────────────┐
   │     Redis (BullMQ Storage)   │  <-- Acts as the Asynchronous Buffer
   └──────────────┬───────────────┘
                  │
        ┌─────────┴─────────┐
        │  Job Allocated    │
        └─────────┬─────────┘
                  ▼
   ┌──────────────────────────────┐
   │    OrderProcessor (Worker)   │  <-- Processes Job Asynchronously in Background
   └──────────────┬───────────────┘
                  │  (Emits Execution Lifecycle State Events)
                  ▼
   ┌──────────────────────────────┐
   │     OrderEventsListener      │  <-- Global Telemetry / System Observability
   └──────────────────────────────┘
```

---

## 🛠️ System Core Components

### 1. Inbound Ingestion Layer (The Controller)
Exposes an entrypoint to accept client payloads. It performs an immediate offload to Redis and answers the client with a tracking `jobId` before executing any business actions.

```typescript
// src/order/order.controller.ts
@Controller('orders')
export class OrderController {
  constructor(
    @InjectQueue('order-processing') private readonly orderQueue: Queue,
  ) {}

  @Post()
  async createOrder(@Body() dto: CreateOrderDto) {
    // Immediate hand-off to Redis with automatic retry configurations
    const job = await this.orderQueue.add('process-checkout', dto, {
      attempts: 3, 
      backoff: {
        type: 'exponential',
        delay: 5000, 
      },
    });

    return {
      success: true,
      message: 'Order received and is processing in the background.',
      jobId: job.id,
    };
  }
}
```

### 2. Decoupled Processing Layer (The Worker)
A stateful, non-blocking background consumer task that drains the queue at a managed pace, insulating downstream relational databases or third-party dependencies from exhaustion.

```typescript
// src/order/order.processor.ts
@Processor('order-processing')
export class OrderProcessor extends WorkerHost {
  async process(job: Job<CreateOrderDto, any, string>): Promise<any> {
    if (job.name === 'process-checkout') {
      // Simulating heavy I/O network operations (Payment Settling, Document Rendering)
      await this.sleep(2000); 
      await this.sleep(1500);

      return { status: 'COMPLETED', processedAt: new Date() };
    }
  }
}
```

### 3. Telemetry & Monitoring Layer (The Event Listener)
Intercepts job cycle state transitions globally, exposing central catchpoints for real-time compliance alerting, performance metrics tracking, and error routing.

```typescript
// src/order/order.events.ts
@QueueEventsListener('order-processing')
export class OrderEventsListener extends QueueEventsHost {
  @OnQueueEvent('completed')
  onCompleted({ jobId, returnvalue }) {
    console.log(`📈 [Global Telemetry] Job ID [${jobId}] completed successfully!`);
  }

  @OnQueueEvent('failed')
  onFailed({ jobId, failedReason }) {
    console.warn(`🚨 [Global Telemetry] Job ID [${jobId}] FAILED. Reason: ${failedReason}`);
  }
}
```

---

## ⚡ Key Architectural Advantages Proved here

* **Microsecond Latency Responses:** API responses are returned immediately to clients, freeing up runtime sockets.
* **Fault-Tolerant Failures:** Includes configured **Exponential Backoff** options, ensuring transient downstream connection drops don't cause data losses.
* **Load Leveling Capacity:** High-concurrency spikes are safely queued inside Redis storage allocations, providing a predictable ingest envelope.

---

## 🚀 Local Environment Setup

### Prerequisites
* Node.js (v20+ LTS recommended)
* pnpm package manager (`npm i -g pnpm`)
* A locally running instance of Redis Server (`brew install redis`)

### Installation Steps

1. **Clone the repository and install dependencies:**
   ```bash
   pnpm install
   ```

2. **Verify your local Redis service state:**
   ```bash
   brew services start redis
   ```

3. **Boot the NestJS application runtime server:**
   ```bash
   pnpm run start:dev
   ```

### Execution Testing

Fire a mock high-volume payload structure at the server endpoint using `curl`:

```bash
curl -X POST http://localhost:3000/orders   -H "Content-Type: application/json"   -d '{"customerEmail": "alpha-builder@example.com", "items": ["item_macbook", "item_keyboard"], "totalPrice": 2499.00}'
```

Watch the shell console timelines. The `curl` command prints an immediate success response while the running background worker terminal sequences the heavy computational simulations asynchronously.

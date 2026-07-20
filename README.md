# Enterprise System Architecture Sandbox

<img width="1553" height="563" alt="Screenshot 2026-07-20 at 9 31 41 AM" src="https://github.com/user-attachments/assets/1503a311-cd25-42b3-af3d-016b20772218" />


A high-performance monorepo demonstrating production-grade backend scaling patterns, distributed traffic control, and a real-time telemetry dashboard. Built to simulate the high-concurrency, failure-tolerant environments.

## 🏗️ Architectural Blueprint

The architecture is split into an event-driven, cache-shielded API gateway (NestJS + Redis) and a low-latency administrative interface (Next.js 14).

```
 ┌────────────────────────────────────────────────────────┐
 │                   Next.js 14 UI Grid                   │
 └───────────────────────────┬────────────────────────────┘
                             │ HTTP GET /catalog/metrics (Polls every 2s)
                             ▼
 ┌────────────────────────────────────────────────────────┐
 │                  NestJS API Gateway                    │
 └─────────────┬────────────────────────────┬─────────────┘
               │                            │
          [CACHE HIT]                 [CACHE MISS]
               │                            │
               ▼                            ▼
   ┌───────────────────────┐    ┌───────────────────────┐
   │   Redis Cache Layer   │    │ Mutex / SingleFlight  │
   │      (2ms Return)     │    │   Concurrency Shield  │
   └───────────────────────┘    └───────────┬───────────┘
                                            │
                                  [COALESCES N REQUESTS]
                                            │
                                            ▼
                                ┌───────────────────────┐
                                │ Primary Compute / DB  │
                                │   (1.5s Heavy Join)   │
                                └───────────────────────┘
```

## 🛠️ Core Systems & Patterns Implemented

### 1. Manual Cache-Aside Pattern (`Redis`)
* **Problem:** Heavy relational queries or deep analytical aggregation calculations degrade database performance and compound request latency.
* **Solution:** Explicitly programmed low-level control flows intercepting traffic at the service boundary. High-demand payloads are returned instantly from a Redis in-memory cache in under **2ms**, bypassing the infrastructure bottleneck entirely.

### 2. Request Coalescing Concurrency Shield (`Mutex Locking`)
* **Problem:** High-volume keys inevitably hit expiration windows under massive traffic surges, resulting in a **Cache Stampede / Thundering Herd** failure mode that overwhelms the primary database.
* **Solution:** An asynchronous localized Mutex Lock registry. When a cache miss occurs under load, only the primary worker thread is permitted to hit the data store. Parallel concurrent operations are dynamically hitched onto the exact same `Promise` object, resolving simultaneously and shielding the primary storage layer.

### 3. Event-Driven Cache Eviction (`Data Coherency`)
* **Problem:** Stale or desynchronized data cached inside memory windows creates severe platform inaccuracies across transactional paths.
* **Solution:** Active eviction hooks integrated directly into mutation/write logic (`POST /catalog/update`). The moment a record changes, an explicit command invalidates the target key space from Redis, forcing the next incoming transaction to safely fetch fresh data.

---

## 📂 Repository Layout

```
.
├── src/                  # NestJS Enterprise Backend Application
│   ├── main.ts           # Global CORS rules, bootstrap configs & server port bindings
│   └── catalog/
│       ├── catalog.controller.ts  # REST Telemetry & Management endpoints
│       └── catalog.service.ts     # Core algorithmic Mutex & Cache control loops
├── web/                  # Next.js 14 Enterprise Administration UI
│   ├── app/
│   │   ├── layout.tsx    # Document structure & viewport settings
│   │   └── page.tsx      # Real-time state polling UI engine
│   └── tailwind.config.js
├── package.json          # Main monorepo dependency ledger
└── README.md             # Systems documentation Architecture Manual
```

---

## ⚡ Quick Start & Verification

### Prerequisites
Ensure your local machine has a running Redis server instance active on its default port:
```bash
redis-cli ping
# Expected response: PONG
```

### 1. Booting the NestJS Telemetry Backend
Navigate to the root directory, install the required dependencies, and launch the server application:
```bash
pnpm install
pnpm run start:dev
```
The API engine will initialize and anchor onto **`http://localhost:3000`**.

### 2. Booting the Next.js Telemetry Dashboard
Open a secondary terminal split, move into the administrative dashboard directory, and execute the development server:
```bash
cd web
pnpm install
pnpm run dev
```
Next.js will detect the port configuration and bind itself immediately to **`http://localhost:3001`**.

---

## 🧪 Simulation Manual & Stress-Testing

### Test 1: Verifying the Coalesced Mutex (Thundering Herd Defense)
To simulate multiple client browser tabs hitting an expired cache key concurrently, trigger multiple parallel requests using background thread executions in your terminal:

```bash
curl http://localhost:3000/catalog/metrics & curl http://localhost:3000/catalog/metrics & curl http://localhost:3000/catalog/metrics
```

#### Terminal Console Logs Output:
```text
⚠️ [METRICS CACHE MISS] Compiling cluster analytics...
🔒 [MUTEX] Coalescing dashboard polling request...
🔒 [MUTEX] Coalescing dashboard polling request...
💾 [CACHE SEED] Redis seeded. Mutex lock released.
```
*Note that despite three parallel executions demanding data, the primary compute engine was only invoked **once**.*

### Test 2: Active Cache Invalidation Path
1. Hit the data pipeline to warm up the cache: `curl http://localhost:3000/catalog/trending` -> *Returns Cache-Aside Payload*.
2. Fire a mock administrator product mutation:
   ```bash
   curl -X POST http://localhost:3000/catalog/update      -H "Content-Type: application/json"      -d '{"itemId": 1, "newPrice": 129.99}'
   ```
3. Observe backend logs confirming immediate cache eviction: `💥 [CACHE EVICTION] Wiping 'catalog:trending' from Redis...`
4. The next client fetch immediately forces a safe database read, guaranteeing complete transactional coherency.

import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class CatalogueService {
  // A localized map to track active, in-flight database promises
  private activeFetches = new Map<string, Promise<any>>();

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getTrendingProducts(): Promise<any> {
    const cacheKey = 'catalog:trending';

    // 1. FAST PATH: Check the Redis Cache
    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) {
      return { source: 'cache', data: cachedData };
    }

    // 2. CONCURRENCY CONTROL: Mutex / Single Flight Check
    // If another request is ALREADY fetching this data, reuse its promise!
    if (this.activeFetches.has(cacheKey)) {
      console.log('🔒 [MUTEX HIT] Coalescing request. Waiting for the active database fetch to finish...');
      const sharedData = await this.activeFetches.get(cacheKey);
      return { source: 'mutex_coalesced', data: sharedData };
    }

    // 3. SLOW PATH: We are the chosen request. Create the lock by saving the promise.
    console.log('⚠️ [CACHE MISS] No active fetch found. Initiating database query...');
    
    const fetchPromise = this.simulateHeavyDatabaseQuery().then(async (dbData) => {
      // Once the database returns, seed Redis and clean up the lock map
      await this.cacheManager.set(cacheKey, dbData, 30000);
      this.activeFetches.delete(cacheKey); 
      console.log('💾 [CACHE SEED] Redis seeded. Mutex lock released.');
      return dbData;
    }).catch((err) => {
      // Fail-safe: Ensure we clear the lock even if the database fails
      this.activeFetches.delete(cacheKey);
      throw err;
    });

    // Register our promise in the map so concurrent requests can see it
    this.activeFetches.set(cacheKey, fetchPromise);

    const data = await fetchPromise;
    return { source: 'database_primary', data };
  }

  private async simulateHeavyDatabaseQuery(): Promise<any[]> {
    await new Promise((resolve) => setTimeout(resolve, 2500));
    return [
      { id: 1, name: 'Enterprise Keyboard', price: 149.99 },
      { id: 2, name: 'Ultrawide Developer Monitor', price: 699.99 },
    ];
  }

// Add this map at the top of your class if not already there
private metricsFetches = new Map<string, Promise<any>>();

async getSystemMetrics(): Promise<any> {
  const cacheKey = 'system:metrics';

  // 1. FAST PATH: Check Redis
  const cachedData = await this.cacheManager.get(cacheKey);
  if (cachedData) {
    return { source: 'Redis Cache', ...cachedData };
  }

  // 2. CONCURRENCY SHIELD: Mutex coalescing
  if (this.metricsFetches.has(cacheKey)) {
    console.log('🔒 [MUTEX] Coalescing dashboard polling request...');
    const sharedData = await this.metricsFetches.get(cacheKey);
    return { source: 'Mutex Coalesced', ...sharedData };
  }

  // 3. SLOW PATH: Compute raw system data
  console.log('⚠️ [METRICS CACHE MISS] Compiling cluster analytics...');
  const fetchPromise = (async () => {
    // Simulate heavy infrastructure querying lag
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const computedMetrics = {
      timestamp: new Date().toISOString(),
      cpuUsage: Math.floor(Math.random() * (75 - 45 + 1)) + 45, // Simulates 45-75% load
      memoryUsage: +(8.4 + Math.random() * 1.2).toFixed(1),   // Simulates 8.4-9.6 GB
      activeWorkers: Math.floor(Math.random() * 5) + 3,
      backgroundJobsQueued: Math.floor(Math.random() * 40) + 10,
    };

    // Cache it for a short 3-second cycle
    await this.cacheManager.set(cacheKey, computedMetrics, 3000);
    this.metricsFetches.delete(cacheKey);
    return computedMetrics;
  })();

  this.metricsFetches.set(cacheKey, fetchPromise);
  const data = await fetchPromise;

  return { source: 'Primary Compute Engine (DB/OS)', ...data };
}

}

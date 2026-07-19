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
}

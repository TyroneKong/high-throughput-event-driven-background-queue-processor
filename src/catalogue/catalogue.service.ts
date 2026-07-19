import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class CatalogueService {
  constructor(
    // Inject the global Redis cache instance we configured earlier
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getTrendingProducts(): Promise<any> {
    const cacheKey = 'catalog:trending';

    // 1. CHOOSE THE CACHE FIRST (Cache Hit Check)
    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) {
      console.log('🚀 [CACHE HIT] Returning data instantly from Redis.');
      return { source: 'cache', data: cachedData };
    }

    // 2. CACHE MISS -> Fallback to the slow database
    console.log('⚠️ [CACHE MISS] Querying database... This is going to be slow.');
    const dbData = await this.simulateHeavyDatabaseQuery();

    // 3. SEED THE CACHE (With a 30-second Time-To-Live expiration)
    // We pass the key, the data, and the TTL configuration object
    await this.cacheManager.set(cacheKey, dbData, 30000); 
    console.log('💾 [CACHE SEED] Saved fresh data to Redis for subsequent requests.');

    return { source: 'database', data: dbData };
  }

  // Helper to simulate a heavy PostgreSQL JOIN or aggregations query
  private async simulateHeavyDatabaseQuery(): Promise<any[]> {
    await new Promise((resolve) => setTimeout(resolve, 2500));
    return [
      { id: 1, name: 'Enterprise Keyboard', price: 149.99 },
      { id: 2, name: 'Ultrawide Developer Monitor', price: 699.99 },
      { id: 3, name: 'Ergonomic Task Chair', price: 349.99 },
    ];
  }
}

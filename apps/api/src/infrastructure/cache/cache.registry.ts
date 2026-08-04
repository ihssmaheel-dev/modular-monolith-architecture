type PublishFn = (key: string) => Promise<void>;

class DistributedCacheRegistry {
  private cache = new Map<string, { value: any; exp: number }>();
  private publishFn?: PublishFn;

  setPublishFn(fn: PublishFn) {
    this.publishFn = fn;
  }

  get(key: string): any | undefined {
    const item = this.cache.get(key);
    if (!item) return undefined;

    if (Date.now() > item.exp) {
      this.cache.delete(key);
      return undefined;
    }

    return item.value;
  }

  set(key: string, value: any, ttlSeconds: number) {
    this.cache.set(key, {
      value,
      exp: Date.now() + ttlSeconds * 1000,
    });
  }

  deleteLocal(key: string) {
    this.cache.delete(key);
  }

  async invalidate(key: string) {
    this.deleteLocal(key);
    if (this.publishFn) {
      try {
        await this.publishFn(key);
      } catch (error) {
        // We log silently if the pub/sub publish fails, ensuring the application doesn't crash
        console.error(`[DistributedCacheRegistry] Failed to publish invalidation for key: ${key}`, error);
      }
    }
  }
}

export const CacheRegistry = new DistributedCacheRegistry();

import { CacheRegistry } from "./cache.registry";

export function Cacheable(keyBuilder: (...args: any[]) => string, ttlSeconds = 300) {
  return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const key = keyBuilder(...args);
      const cached = CacheRegistry.get(key);
      if (cached !== undefined) return cached;
      
      const result = await original.apply(this, args);
      
      // If result is a neverthrow Result, only cache if isOk()
      if (result && typeof result === "object" && "isOk" in result && typeof result.isOk === "function") {
        if (result.isOk()) {
          CacheRegistry.set(key, result, ttlSeconds);
        }
      } else {
        CacheRegistry.set(key, result, ttlSeconds);
      }

      return result;
    };
  };
}

export function CacheEvict(keyBuilder: (...args: any[]) => string) {
  return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const result = await original.apply(this, args);
      
      // We only evict if the action was successful (or if it's not a Result)
      let shouldEvict = true;
      if (result && typeof result === "object" && "isOk" in result && typeof result.isOk === "function") {
        shouldEvict = result.isOk();
      }

      if (shouldEvict) {
        const key = keyBuilder(...args);
        await CacheRegistry.invalidate(key);
      }

      return result;
    };
  };
}

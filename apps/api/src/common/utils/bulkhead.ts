import { err, Result } from "neverthrow";

export interface BulkheadOptions {
  maxConcurrent: number;
}

export class Bulkhead<E> {
  private activeCount = 0;
  private readonly maxConcurrent: number;
  private readonly fallbackError: E;

  constructor(options: BulkheadOptions, fallbackError: E) {
    this.maxConcurrent = options.maxConcurrent;
    this.fallbackError = fallbackError;
  }

  async execute<T>(action: () => Promise<Result<T, E>>): Promise<Result<T, E>> {
    if (this.activeCount >= this.maxConcurrent) {
      return err(this.fallbackError);
    }

    this.activeCount++;
    try {
      return await action();
    } finally {
      this.activeCount--;
    }
  }

  getActiveCount(): number {
    return this.activeCount;
  }
}

import { err, Result } from "neverthrow";

export type CircuitBreakerState = "CLOSED" | "OPEN" | "HALF_OPEN";

export interface CircuitBreakerOptions {
  failureThreshold: number;
  resetTimeoutMs: number;
}

export class CircuitBreaker<E> {
  private state: CircuitBreakerState = "CLOSED";
  private failures = 0;
  private nextAttemptMs = 0;
  
  private readonly threshold: number;
  private readonly timeoutMs: number;
  private readonly fallbackError: E;

  constructor(options: CircuitBreakerOptions, fallbackError: E) {
    this.threshold = options.failureThreshold;
    this.timeoutMs = options.resetTimeoutMs;
    this.fallbackError = fallbackError;
  }

  async execute<T>(action: () => Promise<Result<T, E>>): Promise<Result<T, E>> {
    if (this.state === "OPEN") {
      if (Date.now() > this.nextAttemptMs) {
        this.state = "HALF_OPEN";
      } else {
        return err(this.fallbackError);
      }
    }

    try {
      const result = await action();
      
      if (result.isOk()) {
        this.onSuccess();
      } else {
        this.onFailure();
      }
      
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = "CLOSED";
  }

  private onFailure(): void {
    this.failures++;
    if (this.failures >= this.threshold || this.state === "HALF_OPEN") {
      this.state = "OPEN";
      this.nextAttemptMs = Date.now() + this.timeoutMs;
    }
  }

  getState(): CircuitBreakerState {
    return this.state;
  }
}

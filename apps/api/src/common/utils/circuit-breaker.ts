import { err, Result } from "neverthrow";

export type CircuitBreakerState = "CLOSED" | "OPEN" | "HALF_OPEN";

export interface CircuitBreakerOptions {
  failureThreshold: number;
  resetTimeoutMs: number;
  onStateChange?: (state: CircuitBreakerState) => void;
}

export class CircuitBreaker<E> {
  private state: CircuitBreakerState = "CLOSED";
  private failures = 0;
  private nextAttemptMs = 0;
  
  private readonly threshold: number;
  private readonly timeoutMs: number;
  private readonly fallbackError: E;
  private readonly onStateChange?: (state: CircuitBreakerState) => void;

  constructor(options: CircuitBreakerOptions, fallbackError: E) {
    this.threshold = options.failureThreshold;
    this.timeoutMs = options.resetTimeoutMs;
    this.onStateChange = options.onStateChange;
    this.fallbackError = fallbackError;
  }

  async execute<T>(action: () => Promise<Result<T, E>>): Promise<Result<T, E>> {
    if (this.state === "OPEN") {
      if (Date.now() > this.nextAttemptMs) {
        this.changeState("HALF_OPEN");
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
    if (this.state !== "CLOSED") {
      this.changeState("CLOSED");
    }
  }

  private onFailure(): void {
    this.failures++;
    if (this.failures >= this.threshold || this.state === "HALF_OPEN") {
      this.changeState("OPEN");
      this.nextAttemptMs = Date.now() + this.timeoutMs;
    }
  }

  private changeState(newState: CircuitBreakerState): void {
    if (this.state !== newState) {
      this.state = newState;
      if (this.onStateChange) {
        this.onStateChange(newState);
      }
    }
  }

  getState(): CircuitBreakerState {
    return this.state;
  }
}

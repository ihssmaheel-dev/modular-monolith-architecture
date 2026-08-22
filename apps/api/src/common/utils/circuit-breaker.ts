import { err, Result } from "neverthrow";
import OpossumCircuitBreaker from "opossum";

export type CircuitBreakerState = "CLOSED" | "OPEN" | "HALF_OPEN";

export interface CircuitBreakerOptions {
  failureThreshold: number;
  resetTimeoutMs: number;
  onStateChange?: (state: CircuitBreakerState) => void;
}

export class CircuitBreaker<E> {
  private breaker: OpossumCircuitBreaker<[() => Promise<Result<unknown, E>>], Result<unknown, E>>;
  private readonly fallbackError: E;
  private readonly onStateChange?: (state: CircuitBreakerState) => void;

  constructor(options: CircuitBreakerOptions, fallbackError: E) {
    this.fallbackError = fallbackError;
    this.onStateChange = options.onStateChange;

    this.breaker = new OpossumCircuitBreaker(async (action: () => Promise<Result<unknown, E>>) => {
      const result = await action();
      if (result.isErr()) {
        throw result.error;
      }
      return result;
    }, {
      errorThresholdPercentage: 1, // Any failure after volume threshold opens circuit
      volumeThreshold: options.failureThreshold,
      resetTimeout: options.resetTimeoutMs,
    });

    if (this.onStateChange) {
      this.breaker.on('open', () => this.onStateChange!("OPEN"));
      this.breaker.on('halfOpen', () => this.onStateChange!("HALF_OPEN"));
      this.breaker.on('close', () => this.onStateChange!("CLOSED"));
    }
  }

  async execute<T>(action: () => Promise<Result<T, E>>): Promise<Result<T, E>> {
    try {
      const breaker = this.breaker as unknown as { fire: (a: () => Promise<Result<unknown, E>>) => Promise<Result<T, E>> };
      const result = await breaker.fire(action);
      return result;
    } catch (e: unknown) {
      const error = e as { code?: string; message?: string };
      if (error && (error.code === "EOPENBREAKER" || error.message?.includes("Breaker is open"))) {
        return err(this.fallbackError);
      }
      return err(error as E);
    }
  }

  getState(): CircuitBreakerState {
    if (this.breaker.opened) return "OPEN";
    if (this.breaker.halfOpen) return "HALF_OPEN";
    return "CLOSED";
  }
}

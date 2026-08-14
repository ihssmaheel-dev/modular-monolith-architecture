import { err, Result } from "neverthrow";
import OpossumCircuitBreaker from "opossum";

export type CircuitBreakerState = "CLOSED" | "OPEN" | "HALF_OPEN";

export interface CircuitBreakerOptions {
  failureThreshold: number;
  resetTimeoutMs: number;
  onStateChange?: (state: CircuitBreakerState) => void;
}

export class CircuitBreaker<E> {
  private breaker: OpossumCircuitBreaker<[() => Promise<Result<any, E>>], Result<any, E>>;
  private readonly fallbackError: E;
  private readonly onStateChange?: (state: CircuitBreakerState) => void;

  constructor(options: CircuitBreakerOptions, fallbackError: E) {
    this.fallbackError = fallbackError;
    this.onStateChange = options.onStateChange;

    this.breaker = new OpossumCircuitBreaker(async (action: () => Promise<Result<any, E>>) => {
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
      const result = await (this.breaker as any).fire(action);
      return result as Result<T, E>;
    } catch (e: any) {
      // Opossum throws its own error when the circuit is open (usually with code 'EOPENBREAKER' or message 'Breaker is open')
      if (e && (e.code === 'EOPENBREAKER' || e.message?.includes('Breaker is open'))) {
        return err(this.fallbackError);
      }
      // Otherwise, this is the underlying error we threw from the action when it returned a Result.err
      return err(e);
    }
  }

  getState(): CircuitBreakerState {
    if (this.breaker.opened) return "OPEN";
    if (this.breaker.halfOpen) return "HALF_OPEN";
    return "CLOSED";
  }
}

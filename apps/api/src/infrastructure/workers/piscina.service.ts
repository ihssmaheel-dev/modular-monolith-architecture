import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { Piscina } from "piscina";
import { PinoLoggerService } from "../logger/logger.service";

const DEFAULT_MAX_THREADS = 4;

export interface WorkerPoolConfig {
  name: string;
  filename: string;
  maxThreads?: number;
}

@Injectable()
export class PiscinaService implements OnModuleDestroy {
  private pools = new Map<string, Piscina>();
  private logger: PinoLoggerService;

  constructor(logger: PinoLoggerService) {
    this.logger = logger;
  }

  getPool(config: WorkerPoolConfig): Piscina {
    if (!this.pools.has(config.name)) {
      const maxThreads = config.maxThreads ?? DEFAULT_MAX_THREADS;
      const pool = new Piscina({
        filename: config.filename,
        maxThreads,
      });
      this.pools.set(config.name, pool);
      this.logger.info(
        { pool: config.name, maxThreads },
        "Worker pool created",
      );
    }
    return this.pools.get(config.name)!;
  }

  async run<TInput = unknown, TOutput = unknown>(
    poolName: string,
    task: string,
    data: TInput,
  ): Promise<TOutput> {
    const pool = this.pools.get(poolName);
    if (!pool) {
      throw new Error(`Worker pool "${poolName}" not found. Call getPool() first.`);
    }

    this.logger.debug({ pool: poolName, task }, "Running worker task");
    const result = await pool.run(data, { name: task });
    return result as TOutput;
  }

  getStats(poolName: string) {
    const pool = this.pools.get(poolName);
    if (!pool) return null;
    return {
      completed: pool.completed,
      ratio: pool.ratio,
      threads: pool.threads.length,
      queueSize: pool.queueSize,
    };
  }

  async onModuleDestroy() {
    for (const [name, pool] of this.pools) {
      this.logger.info({ pool: name }, "Destroying worker pool");
      await pool.destroy();
    }
  }
}

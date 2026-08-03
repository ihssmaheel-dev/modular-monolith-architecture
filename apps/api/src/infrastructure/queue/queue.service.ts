import { Injectable, BeforeApplicationShutdown } from "@nestjs/common";
import { Queue, Worker, Job } from "bullmq";
import { trace, context as otelContext, propagation } from "@opentelemetry/api";
import { env } from "../../config/env";

@Injectable()
export class QueueService implements BeforeApplicationShutdown {
  private queues = new Map<string, Queue>();
  private workers = new Map<string, Worker>();

  getQueue<T = unknown>(name: string): Queue<T> | null {
    if (!env.REDIS_URL) return null;

    if (!this.queues.has(name)) {
      const queue = new Queue<T>(name, {
        connection: { url: env.REDIS_URL },
      });
      
      const originalAdd = queue.add.bind(queue);
      queue.add = async (jobName: string, data: any, opts?: any) => {
        const carrier = {};
        propagation.inject(otelContext.active(), carrier);
        const enrichedData = typeof data === "object" && data !== null 
          ? { ...data, _trace: carrier } 
          : { data, _trace: carrier };
        return originalAdd(jobName as any, enrichedData as any, opts);
      };

      this.queues.set(name, queue as Queue);
    }
    return this.queues.get(name)! as Queue<T>;
  }

  addWorker<T = unknown>(
    name: string,
    handler: (job: Job<T>) => Promise<void>,
  ): Worker<T> | null {
    if (!env.REDIS_URL) return null;

    // @ts-ignore - BullMQ v5 has overly strict generic inference for generic wrappers
    const worker = new Worker(
      name as any,
      async (job: Job<any>) => {
        const carrier = (job.data as any)?._trace;
        const parentCtx = propagation.extract(otelContext.active(), carrier || {});
        
        return otelContext.with(parentCtx, async () => {
          const tracer = trace.getTracer("queue-worker");
          return tracer.startActiveSpan(`Job: ${name}`, async (span) => {
            try {
              await handler(job as Job<T>);
            } catch (err: any) {
              span.recordException(err);
              throw err;
            } finally {
              span.end();
            }
          });
        });
      },
      { connection: { url: env.REDIS_URL } },
    ) as unknown as Worker<T>;
    this.workers.set(name, worker as Worker);
    return worker;
  }

  async beforeApplicationShutdown() {
    for (const queue of this.queues.values()) {
      await queue.close();
    }
    for (const worker of this.workers.values()) {
      await worker.close();
    }
  }
}

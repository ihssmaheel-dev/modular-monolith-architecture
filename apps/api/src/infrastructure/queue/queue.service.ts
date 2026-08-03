import { Injectable, BeforeApplicationShutdown } from "@nestjs/common";
import { Queue, Worker, Job } from "bullmq";
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
      this.queues.set(name, queue as Queue);
    }
    return this.queues.get(name)! as Queue<T>;
  }

  addWorker<T = unknown>(
    name: string,
    handler: (job: Job<T>) => Promise<void>,
  ): Worker<T> | null {
    if (!env.REDIS_URL) return null;

    const worker = new Worker<T>(
      name,
      async (job) => {
        await handler(job);
      },
      { connection: { url: env.REDIS_URL } },
    );
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

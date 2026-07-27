import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { Queue, Worker } from "bullmq";
import { env } from "../../config/env";

@Injectable()
export class QueueService implements OnModuleDestroy {
  private queues = new Map<string, Queue>();
  private workers = new Map<string, Worker>();

  getQueue(name: string): Queue {
    if (!this.queues.has(name)) {
      const queue = new Queue(name, {
        connection: { url: env.REDIS_URL },
      });
      this.queues.set(name, queue);
    }
    return this.queues.get(name)!;
  }

  addWorker(name: string, handler: (job: any) => Promise<void>): Worker {
    const worker = new Worker(
      name,
      async (job) => {
        await handler(job);
      },
      { connection: { url: env.REDIS_URL } },
    );
    this.workers.set(name, worker);
    return worker;
  }

  async onModuleDestroy() {
    for (const queue of this.queues.values()) {
      await queue.close();
    }
    for (const worker of this.workers.values()) {
      await worker.close();
    }
  }
}

import { Queue } from "bullmq";
import type { JobsOptions, QueueOptions } from "bullmq";
import type { JobDispatchOptions, QueueDispatcher } from "@queue/QueueDispatcher";

type QueueClient = Pick<Queue, "add" | "close">;

export class BullMqQueueDispatcher implements QueueDispatcher {
  private readonly queue: QueueClient;

  constructor(
    queueName: string,
    options: QueueOptions,
    private readonly defaults: JobsOptions = {},
    queue?: QueueClient
  ) {
    this.queue = queue ?? new Queue(queueName, options);
  }

  async dispatch<TPayload>(jobName: string, payload: TPayload, options: JobDispatchOptions = {}): Promise<void> {
    await this.queue.add(jobName, payload, {
      ...this.defaults,
      ...options,
    });
  }

  async close(): Promise<void> {
    await this.queue.close();
  }
}

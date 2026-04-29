import { Worker } from "bullmq";
import type { WorkerOptions } from "bullmq";
import { config } from "@config/index";
import { registerJobs } from "@jobs";
import type { JobRegistry } from "@jobs/JobRegistry";
import { registerQueuedEventListeners } from "@listeners";
import { createMailer } from "@mail";

type QueueJob = {
  id?: string;
  name: string;
  data: unknown;
};

export type QueueWorker = Pick<Worker, "close" | "on">;

type QueueWorkerConstructor = new (
  queueName: string,
  processor: (job: QueueJob) => Promise<void>,
  options: WorkerOptions
) => QueueWorker;

export type CreateQueueWorkerOptions = {
  queueName?: string;
  connection?: WorkerOptions["connection"];
  concurrency?: number;
  registry?: JobRegistry;
  WorkerClass?: QueueWorkerConstructor;
};

export function createQueueWorker(options: CreateQueueWorkerOptions = {}): QueueWorker {
  const registry = options.registry ?? registerJobs(createMailer(), registerQueuedEventListeners());
  const WorkerClass = options.WorkerClass ?? Worker;
  const queueName = options.queueName ?? config.queue.name;
  const connection = options.connection ?? config.queue.connection;
  const concurrency = options.concurrency ?? Number(process.env.QUEUE_WORKER_CONCURRENCY || 1);

  const worker = new WorkerClass(
    queueName,
    async (job: QueueJob) => {
      await registry.handle(job.name, job.data);
    },
    {
      connection,
      concurrency,
    }
  );

  worker.on("completed", (job: QueueJob) => {
    console.log(`[queue]: ${job.name}#${job.id} completed`);
  });

  worker.on("failed", (job: QueueJob | undefined, error: Error) => {
    console.error(`[queue]: ${job?.name ?? "unknown"}#${job?.id ?? "unknown"} failed`, error);
  });

  return worker;
}

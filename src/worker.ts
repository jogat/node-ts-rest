import { Worker } from "bullmq";
import { config } from "@config/index";
import { createMailer } from "@mail";
import { registerJobs } from "@jobs";

export function createWorker(): Worker {
  const registry = registerJobs(createMailer());
  const worker = new Worker(
    config.queue.name,
    async (job) => {
      await registry.handle(job.name, job.data);
    },
    {
      connection: config.queue.connection,
      concurrency: Number(process.env.QUEUE_WORKER_CONCURRENCY || 1),
    }
  );

  worker.on("completed", (job) => {
    console.log(`[queue]: ${job.name}#${job.id} completed`);
  });

  worker.on("failed", (job, error) => {
    console.error(`[queue]: ${job?.name ?? "unknown"}#${job?.id ?? "unknown"} failed`, error);
  });

  return worker;
}

export async function runWorker(): Promise<void> {
  const worker = createWorker();

  const shutdown = async () => {
    console.log("[queue]: shutting down worker");
    await worker.close();
    process.exit(0);
  };

  process.on("SIGINT", () => {
    void shutdown();
  });
  process.on("SIGTERM", () => {
    void shutdown();
  });

  console.log(`[queue]: worker listening on "${config.queue.name}"`);
}

if (require.main === module) {
  void runWorker().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

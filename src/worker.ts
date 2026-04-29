import { config } from "@config/index";
import { createQueueWorker } from "@queue";
import type { QueueWorker } from "@queue/BullMqQueueWorker";

export function createWorker(): QueueWorker {
  return createQueueWorker();
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

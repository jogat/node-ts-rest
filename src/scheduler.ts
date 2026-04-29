import { defineSchedule, NodeCronScheduler, Schedule } from "@schedule";

export function createScheduler(): NodeCronScheduler {
  const schedule = new Schedule();
  defineSchedule(schedule);

  return new NodeCronScheduler(schedule);
}

export async function runScheduler(): Promise<void> {
  const scheduler = createScheduler();
  scheduler.start();

  const shutdown = async () => {
    console.log("[schedule]: shutting down scheduler");
    await scheduler.stop();
    process.exit(0);
  };

  process.on("SIGINT", () => {
    void shutdown();
  });
  process.on("SIGTERM", () => {
    void shutdown();
  });

  console.log("[schedule]: scheduler started");
}

if (require.main === module) {
  void runScheduler().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

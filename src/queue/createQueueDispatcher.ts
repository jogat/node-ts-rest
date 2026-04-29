import { config } from "@config/index";
import { BullMqQueueDispatcher } from "@queue/BullMqQueueDispatcher";
import { FakeQueueDispatcher } from "@queue/FakeQueueDispatcher";
import type { QueueDispatcher } from "@queue/QueueDispatcher";

export function createQueueDispatcher(): QueueDispatcher {
  if (config.app.environment === "test") {
    return new FakeQueueDispatcher();
  }

  return new BullMqQueueDispatcher(
    config.queue.name,
    {
      connection: config.queue.connection,
      defaultJobOptions: {
        attempts: config.queue.defaults.attempts,
        backoff: {
          type: "exponential",
          delay: config.queue.defaults.backoffDelay,
        },
        removeOnComplete: config.queue.defaults.removeOnComplete,
        removeOnFail: config.queue.defaults.removeOnFail,
      },
    },
    {
      attempts: config.queue.defaults.attempts,
      backoff: {
        type: "exponential",
        delay: config.queue.defaults.backoffDelay,
      },
      removeOnComplete: config.queue.defaults.removeOnComplete,
      removeOnFail: config.queue.defaults.removeOnFail,
    }
  );
}

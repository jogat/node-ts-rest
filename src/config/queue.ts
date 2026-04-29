export type QueueConfig = {
  name: string;
  connection: {
    host: string;
    port: number;
    password?: string;
    db?: number;
    maxRetriesPerRequest: null;
  };
  defaults: {
    attempts: number;
    backoffDelay: number;
    removeOnComplete: boolean | number;
    removeOnFail: boolean | number;
  };
};

export const queueConfig: QueueConfig = {
  name: process.env.QUEUE_NAME || "default",
  connection: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT || 6379),
    password: process.env.REDIS_PASSWORD || undefined,
    db: process.env.REDIS_DB ? Number(process.env.REDIS_DB) : undefined,
    maxRetriesPerRequest: null,
  },
  defaults: {
    attempts: Number(process.env.QUEUE_ATTEMPTS || 3),
    backoffDelay: Number(process.env.QUEUE_BACKOFF_DELAY || 1000),
    removeOnComplete: Number(process.env.QUEUE_REMOVE_ON_COMPLETE || 100),
    removeOnFail: Number(process.env.QUEUE_REMOVE_ON_FAIL || 1000),
  },
};

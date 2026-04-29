export type JobBackoffOptions = {
  type: "fixed" | "exponential";
  delay: number;
};

export type JobDispatchOptions = {
  delay?: number;
  attempts?: number;
  backoff?: JobBackoffOptions;
};

export interface QueueDispatcher {
  dispatch<TPayload>(jobName: string, payload: TPayload, options?: JobDispatchOptions): Promise<void>;
}

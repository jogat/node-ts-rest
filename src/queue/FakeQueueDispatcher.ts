import type { JobDispatchOptions, QueueDispatcher } from "@queue/QueueDispatcher";

export type DispatchedJob<TPayload = unknown> = {
  name: string;
  payload: TPayload;
  options?: JobDispatchOptions;
};

export class FakeQueueDispatcher implements QueueDispatcher {
  private jobs: DispatchedJob[] = [];

  async dispatch<TPayload>(jobName: string, payload: TPayload, options?: JobDispatchOptions): Promise<void> {
    this.jobs.push({
      name: jobName,
      payload,
      options,
    });
  }

  all(): DispatchedJob[] {
    return [...this.jobs];
  }

  clear(): void {
    this.jobs = [];
  }
}

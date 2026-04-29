import type { JobHandler } from "@jobs/JobHandler";

export class JobRegistry {
  private handlers = new Map<string, JobHandler>();

  register<TPayload>(jobName: string, handler: JobHandler<TPayload>): void {
    this.handlers.set(jobName, handler as JobHandler);
  }

  async handle<TPayload>(jobName: string, payload: TPayload): Promise<void> {
    const handler = this.handlers.get(jobName);

    if (!handler) {
      throw new Error(`Job "${jobName}" is not registered.`);
    }

    await handler.handle(payload);
  }

  names(): string[] {
    return [...this.handlers.keys()];
  }
}

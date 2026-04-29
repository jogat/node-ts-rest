import cron from "node-cron";
import type { NodeCron, ScheduledTask } from "node-cron";
import { runArtisan } from "@console/artisan";
import { createQueueDispatcher } from "@queue";
import type { QueueDispatcher } from "@queue";
import type { Schedule, ScheduledTaskDefinition } from "@schedule/Schedule";

type CommandRunner = (argv: string[]) => Promise<void>;

type CloseableQueueDispatcher = QueueDispatcher & {
  close?: () => Promise<void>;
};

export type NodeCronSchedulerOptions = {
  cron?: Pick<NodeCron, "schedule">;
  queue?: CloseableQueueDispatcher;
  runCommand?: CommandRunner;
};

function commandToArgv(command: string): string[] {
  const parts = command.match(/"[^"]*"|'[^']*'|\S+/g) ?? [];

  return parts.map((part) => {
    if ((part.startsWith('"') && part.endsWith('"')) || (part.startsWith("'") && part.endsWith("'"))) {
      return part.slice(1, -1);
    }

    return part;
  });
}

export class NodeCronScheduler {
  private readonly cron: Pick<NodeCron, "schedule">;
  private readonly queue: CloseableQueueDispatcher;
  private readonly runCommand: CommandRunner;
  private readonly registeredTasks: ScheduledTask[] = [];

  constructor(private readonly schedule: Schedule, options: NodeCronSchedulerOptions = {}) {
    this.cron = options.cron ?? cron;
    this.queue = options.queue ?? createQueueDispatcher();
    this.runCommand = options.runCommand ?? runArtisan;
  }

  start(): ScheduledTask[] {
    const tasks = this.schedule.tasks();

    for (const task of tasks) {
      const scheduledTask = this.cron.schedule(task.expression, () => this.runTask(task), {
        name: task.name,
        timezone: task.timezone,
      });

      this.registeredTasks.push(scheduledTask);
    }

    return [...this.registeredTasks];
  }

  async stop(): Promise<void> {
    await Promise.all(this.registeredTasks.map((task) => task.stop()));
    await this.queue.close?.();
  }

  private async runTask(task: ScheduledTaskDefinition): Promise<void> {
    if (task.kind === "command") {
      await this.runCommand(["node", "artisan", ...commandToArgv(task.command)]);
      return;
    }

    if (task.kind === "job") {
      await this.queue.dispatch(task.jobName, task.payload);
      return;
    }

    await task.callback();
  }
}

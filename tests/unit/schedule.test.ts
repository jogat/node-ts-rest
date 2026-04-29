import { describe, expect, it, vi } from "vitest";
import type { ScheduledTask } from "node-cron";
import { NodeCronScheduler, Schedule } from "@schedule";

function createCronFake() {
  type RegisteredTask = ScheduledTask & {
    stop: ReturnType<typeof vi.fn>;
  };

  const registered: Array<{
    expression: string;
    callback: () => void | Promise<void>;
    options?: {
      name?: string;
      timezone?: string;
    };
    task: RegisteredTask;
  }> = [];

  return {
    registered,
    cron: {
      schedule: vi.fn((expression, callback, options) => {
        const task = {
          id: "task-id",
          name: options?.name,
          start: vi.fn(),
          stop: vi.fn().mockResolvedValue(undefined),
          getStatus: vi.fn().mockReturnValue("idle"),
          destroy: vi.fn(),
          execute: vi.fn().mockResolvedValue(undefined),
          getNextRun: vi.fn().mockReturnValue(null),
          on: vi.fn(),
          off: vi.fn(),
          once: vi.fn(),
        } satisfies RegisteredTask;

        registered.push({
          expression,
          callback,
          options,
          task,
        });

        return task;
      }),
    },
  };
}

describe("Schedule", () => {
  it("maps readable frequency helpers to cron expressions", () => {
    const schedule = new Schedule();

    schedule.command("every minute").everyMinute();
    schedule.command("every two").everyTwoMinutes();
    schedule.command("every five").everyFiveMinutes();
    schedule.command("every ten").everyTenMinutes();
    schedule.command("every fifteen").everyFifteenMinutes();
    schedule.command("every thirty").everyThirtyMinutes();
    schedule.command("hourly").hourly();
    schedule.command("hourly at").hourlyAt(15);
    schedule.command("daily").daily();
    schedule.command("daily at").dailyAt("03:00");
    schedule.command("weekly").weekly();
    schedule.command("weekly on").weeklyOn(2, "04:30");
    schedule.command("monthly").monthly();
    schedule.command("monthly on").monthlyOn(15, "12:45");
    schedule.command("weekdays").weekdays();
    schedule.command("weekends").weekends();

    expect(schedule.tasks().map((task) => task.expression)).toEqual([
      "* * * * *",
      "*/2 * * * *",
      "*/5 * * * *",
      "*/10 * * * *",
      "*/15 * * * *",
      "*/30 * * * *",
      "0 * * * *",
      "15 * * * *",
      "0 0 * * *",
      "0 3 * * *",
      "0 0 * * 0",
      "30 4 * * 2",
      "0 0 1 * *",
      "45 12 15 * *",
      "0 0 * * 1-5",
      "0 0 * * 0,6",
    ]);
  });

  it("stores timezone metadata on scheduled tasks", () => {
    const schedule = new Schedule();

    schedule.command("db status").dailyAt("03:00").timezone("America/Chicago");

    expect(schedule.tasks()[0]).toEqual(
      expect.objectContaining({
        expression: "0 3 * * *",
        timezone: "America/Chicago",
      })
    );
  });

  it("keeps raw cron available as an advanced escape hatch", () => {
    const schedule = new Schedule();

    schedule.command("db status").cron("5 3 * * 1,3");

    expect(schedule.tasks()[0]).toEqual(
      expect.objectContaining({
        expression: "5 3 * * 1,3",
      })
    );
  });
});

describe("NodeCronScheduler", () => {
  it("registers tasks with node-cron", () => {
    const { cron } = createCronFake();
    const schedule = new Schedule();
    const queue = {
      dispatch: vi.fn().mockResolvedValue(undefined),
    };

    schedule.command("db status").dailyAt("03:00").timezone("America/Chicago");

    new NodeCronScheduler(schedule, {
      cron,
      queue,
      runCommand: vi.fn().mockResolvedValue(undefined),
    }).start();

    expect(cron.schedule).toHaveBeenCalledWith("0 3 * * *", expect.any(Function), {
      name: "db status",
      timezone: "America/Chicago",
    });
  });

  it("runs scheduled commands through artisan argv", async () => {
    const { cron, registered } = createCronFake();
    const runCommand = vi.fn().mockResolvedValue(undefined);
    const schedule = new Schedule();
    const queue = {
      dispatch: vi.fn().mockResolvedValue(undefined),
    };

    schedule.command("db status").dailyAt("03:00");

    new NodeCronScheduler(schedule, {
      cron,
      queue,
      runCommand,
    }).start();

    await registered[0].callback();

    expect(runCommand).toHaveBeenCalledWith(["node", "artisan", "db", "status"]);
  });

  it("dispatches scheduled jobs through the queue dispatcher", async () => {
    const { cron, registered } = createCronFake();
    const queue = {
      dispatch: vi.fn().mockResolvedValue(undefined),
    };
    const schedule = new Schedule();

    schedule.job("mail.send", { to: "user@example.com" }).everyFiveMinutes();

    new NodeCronScheduler(schedule, {
      cron,
      queue,
      runCommand: vi.fn().mockResolvedValue(undefined),
    }).start();

    await registered[0].callback();

    expect(queue.dispatch).toHaveBeenCalledWith("mail.send", {
      to: "user@example.com",
    });
  });

  it("runs scheduled callbacks", async () => {
    const { cron, registered } = createCronFake();
    const callback = vi.fn().mockResolvedValue(undefined);
    const schedule = new Schedule();
    const queue = {
      dispatch: vi.fn().mockResolvedValue(undefined),
    };

    schedule.call("cleanup-temp-files", callback).dailyAt("02:00");

    new NodeCronScheduler(schedule, {
      cron,
      queue,
      runCommand: vi.fn().mockResolvedValue(undefined),
    }).start();

    await registered[0].callback();

    expect(callback).toHaveBeenCalledOnce();
  });

  it("stops registered tasks and closes the queue dispatcher", async () => {
    const { cron, registered } = createCronFake();
    const queue = {
      dispatch: vi.fn().mockResolvedValue(undefined),
      close: vi.fn().mockResolvedValue(undefined),
    };
    const schedule = new Schedule();
    const scheduler = new NodeCronScheduler(schedule, {
      cron,
      queue,
      runCommand: vi.fn().mockResolvedValue(undefined),
    });

    schedule.command("db status").dailyAt("03:00");
    scheduler.start();

    await scheduler.stop();

    expect(registered[0].task.stop).toHaveBeenCalledOnce();
    expect(queue.close).toHaveBeenCalledOnce();
  });
});

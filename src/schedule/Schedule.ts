export type ScheduledTaskKind = "command" | "callback" | "job";

export type ScheduledTaskDefinition =
  | {
      kind: "command";
      name: string;
      expression: string;
      timezone?: string;
      command: string;
    }
  | {
      kind: "callback";
      name: string;
      expression: string;
      timezone?: string;
      callback: () => void | Promise<void>;
    }
  | {
      kind: "job";
      name: string;
      expression: string;
      timezone?: string;
      jobName: string;
      payload: unknown;
    };

type TaskDraft =
  | {
      kind: "command";
      name: string;
      expression?: string;
      timezone?: string;
      command: string;
    }
  | {
      kind: "callback";
      name: string;
      expression?: string;
      timezone?: string;
      callback: () => void | Promise<void>;
    }
  | {
      kind: "job";
      name: string;
      expression?: string;
      timezone?: string;
      jobName: string;
      payload: unknown;
    };

function parseTime(time: string): { hour: number; minute: number } {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time);

  if (!match) {
    throw new Error(`Invalid schedule time "${time}". Use HH:mm format.`);
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    throw new Error(`Invalid schedule time "${time}". Use a 24-hour HH:mm value.`);
  }

  return { hour, minute };
}

function assertMinute(minute: number): void {
  if (!Number.isInteger(minute) || minute < 0 || minute > 59) {
    throw new Error(`Invalid schedule minute "${minute}". Use a value from 0 to 59.`);
  }
}

function assertDayOfWeek(day: number): void {
  if (!Number.isInteger(day) || day < 0 || day > 6) {
    throw new Error(`Invalid schedule weekday "${day}". Use 0 for Sunday through 6 for Saturday.`);
  }
}

function assertDayOfMonth(day: number): void {
  if (!Number.isInteger(day) || day < 1 || day > 31) {
    throw new Error(`Invalid schedule month day "${day}". Use a value from 1 to 31.`);
  }
}

export class ScheduledTaskBuilder {
  constructor(private readonly draft: TaskDraft) {}

  cron(expression: string): this {
    this.draft.expression = expression;
    return this;
  }

  everyMinute(): this {
    return this.cron("* * * * *");
  }

  everyTwoMinutes(): this {
    return this.cron("*/2 * * * *");
  }

  everyFiveMinutes(): this {
    return this.cron("*/5 * * * *");
  }

  everyTenMinutes(): this {
    return this.cron("*/10 * * * *");
  }

  everyFifteenMinutes(): this {
    return this.cron("*/15 * * * *");
  }

  everyThirtyMinutes(): this {
    return this.cron("*/30 * * * *");
  }

  hourly(): this {
    return this.cron("0 * * * *");
  }

  hourlyAt(minute: number): this {
    assertMinute(minute);
    return this.cron(`${minute} * * * *`);
  }

  daily(): this {
    return this.dailyAt("00:00");
  }

  dailyAt(time: string): this {
    const { hour, minute } = parseTime(time);
    return this.cron(`${minute} ${hour} * * *`);
  }

  weekly(): this {
    return this.weeklyOn(0);
  }

  weeklyOn(day: number, time = "00:00"): this {
    assertDayOfWeek(day);
    const { hour, minute } = parseTime(time);
    return this.cron(`${minute} ${hour} * * ${day}`);
  }

  monthly(): this {
    return this.monthlyOn(1);
  }

  monthlyOn(day: number, time = "00:00"): this {
    assertDayOfMonth(day);
    const { hour, minute } = parseTime(time);
    return this.cron(`${minute} ${hour} ${day} * *`);
  }

  weekdays(): this {
    return this.cron("0 0 * * 1-5");
  }

  weekends(): this {
    return this.cron("0 0 * * 0,6");
  }

  timezone(timezone: string): this {
    this.draft.timezone = timezone;
    return this;
  }

  toTask(): ScheduledTaskDefinition {
    if (!this.draft.expression) {
      throw new Error(`Scheduled task "${this.draft.name}" is missing a frequency.`);
    }

    return {
      ...this.draft,
      expression: this.draft.expression,
    };
  }
}

export class Schedule {
  private readonly entries: ScheduledTaskBuilder[] = [];

  command(command: string): ScheduledTaskBuilder {
    return this.add({
      kind: "command",
      name: command,
      command,
    });
  }

  call(name: string, callback: () => void | Promise<void>): ScheduledTaskBuilder {
    return this.add({
      kind: "callback",
      name,
      callback,
    });
  }

  job<TPayload>(jobName: string, payload: TPayload): ScheduledTaskBuilder {
    return this.add({
      kind: "job",
      name: jobName,
      jobName,
      payload,
    });
  }

  tasks(): ScheduledTaskDefinition[] {
    return this.entries.map((entry) => entry.toTask());
  }

  private add(draft: TaskDraft): ScheduledTaskBuilder {
    const builder = new ScheduledTaskBuilder(draft);
    this.entries.push(builder);
    return builder;
  }
}

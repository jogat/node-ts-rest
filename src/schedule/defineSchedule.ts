import type { Schedule } from "@schedule/Schedule";

export function defineSchedule(schedule: Schedule): void {
  schedule.command("db status").dailyAt("03:00");
}

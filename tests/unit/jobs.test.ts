import { describe, expect, it, vi } from "vitest";
import { JobRegistry, SEND_MAIL_JOB, SendMailJob } from "@jobs";
import type { Mailer } from "@mail";

describe("Jobs", () => {
  it("dispatches registered jobs to their handlers", async () => {
    const registry = new JobRegistry();
    const handler = {
      handle: vi.fn().mockResolvedValue(undefined),
    };

    registry.register("example", handler);

    await registry.handle("example", { ok: true });

    expect(handler.handle).toHaveBeenCalledWith({ ok: true });
    expect(registry.names()).toEqual(["example"]);
  });

  it("throws for unknown jobs", async () => {
    const registry = new JobRegistry();

    await expect(registry.handle("missing", {})).rejects.toThrow('Job "missing" is not registered.');
  });

  it("sends mail from the mail job", async () => {
    const mailer: Mailer = {
      send: vi.fn().mockResolvedValue({ messageId: "sent" }),
    };
    const job = new SendMailJob(mailer);

    await job.handle({
      to: "user@example.com",
      subject: "Welcome",
      text: "Hello.",
    });

    expect(mailer.send).toHaveBeenCalledWith({
      to: "user@example.com",
      subject: "Welcome",
      text: "Hello.",
    });
    expect(SEND_MAIL_JOB).toBe("mail.send");
  });
});

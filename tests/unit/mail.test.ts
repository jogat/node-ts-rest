import { describe, expect, it, vi } from "vitest";
import { FakeMailer, NodemailerMailer } from "@mail";

describe("Mailers", () => {
  it("records messages with the fake mailer", async () => {
    const mailer = new FakeMailer();

    const result = await mailer.send({
      to: "user@example.com",
      subject: "Welcome",
      text: "Hello.",
    });

    expect(result).toEqual({
      messageId: "fake-1",
    });
    expect(mailer.all()).toEqual([
      {
        to: "user@example.com",
        subject: "Welcome",
        text: "Hello.",
      },
    ]);
  });

  it("sends messages through a Nodemailer transport", async () => {
    const transport = {
      sendMail: vi.fn().mockResolvedValue({
        messageId: "message-id",
      }),
    };
    const mailer = new NodemailerMailer(transport, "App <app@example.com>");

    const result = await mailer.send({
      to: "user@example.com",
      subject: "Welcome",
      text: "Hello.",
    });

    expect(transport.sendMail).toHaveBeenCalledWith({
      from: "App <app@example.com>",
      to: "user@example.com",
      subject: "Welcome",
      text: "Hello.",
      html: undefined,
    });
    expect(result.messageId).toBe("message-id");
  });
});

import { describe, expect, it } from "vitest";
import { InMemoryNotificationChannel, Notification, Notifier } from "@notifications";

type TestUser = {
  id: number;
  email: string;
};

class TestNotification implements Notification<TestUser> {
  readonly type = "test.notification";

  toMessage(user: TestUser) {
    return {
      subject: "Test notification",
      body: `Sent to ${user.email}.`,
      data: {
        user_id: user.id,
      },
    };
  }
}

describe("Notifier", () => {
  it("delivers notifications through the in-memory channel", async () => {
    const channel = new InMemoryNotificationChannel();
    const notifier = new Notifier([channel]);

    await notifier.send({ id: 1, email: "notify@example.com" }, new TestNotification());

    expect(channel.all()).toMatchObject([
      {
        channel: "memory",
        type: "test.notification",
        notifiable: {
          id: 1,
          email: "notify@example.com",
        },
        message: {
          subject: "Test notification",
          body: "Sent to notify@example.com.",
          data: {
            user_id: 1,
          },
        },
      },
    ]);
    expect(channel.all()[0].sentAt).toBeInstanceOf(Date);
  });
});

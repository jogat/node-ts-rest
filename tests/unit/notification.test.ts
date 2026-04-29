import { describe, expect, it } from "vitest";
import { InMemoryNotificationChannel, Notification, Notifier, QueuedMailNotificationChannel } from "@notifications";
import { SEND_MAIL_JOB } from "@jobs";
import { FakeQueueDispatcher } from "@queue";

type TestUser = {
  id: number;
  name?: string;
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

  it("queues mail notifications for emailable notifiables", async () => {
    const queue = new FakeQueueDispatcher();
    const channel = new QueuedMailNotificationChannel(queue);

    await channel.send({ id: 1, name: "Notify User", email: "notify@example.com" }, new TestNotification());

    expect(queue.all()).toEqual([
      {
        name: SEND_MAIL_JOB,
        payload: {
          to: {
            name: "Notify User",
            address: "notify@example.com",
          },
          subject: "Test notification",
          text: "Sent to notify@example.com.",
          metadata: {
            notification_type: "test.notification",
            user_id: 1,
          },
        },
        options: undefined,
      },
    ]);
  });
});

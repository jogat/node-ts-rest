import { EventDispatcher, PostCreated, PostUpdated, UserLoggedIn, UserRegistered } from "@events";
import { Notifier } from "@notifications";
import { SendPostCreatedNotification, SendPostUpdatedNotification } from "@listeners/SendPostChangedNotification";
import { SendUserLoggedInNotification } from "@listeners/SendUserLoggedInNotification";
import { SendUserRegisteredNotification } from "@listeners/SendUserRegisteredNotification";

export function registerEventListeners(dispatcher: EventDispatcher, notifier: Notifier): void {
  const sendUserRegisteredNotification = new SendUserRegisteredNotification(notifier);
  const sendUserLoggedInNotification = new SendUserLoggedInNotification(notifier);
  const sendPostCreatedNotification = new SendPostCreatedNotification(notifier);
  const sendPostUpdatedNotification = new SendPostUpdatedNotification(notifier);

  dispatcher.listen(UserRegistered, (event) => sendUserRegisteredNotification.handle(event));
  dispatcher.listen(UserLoggedIn, (event) => sendUserLoggedInNotification.handle(event));
  dispatcher.listen(PostCreated, (event) => sendPostCreatedNotification.handle(event));
  dispatcher.listen(PostUpdated, (event) => sendPostUpdatedNotification.handle(event));
}

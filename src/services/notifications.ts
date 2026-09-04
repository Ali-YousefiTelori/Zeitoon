import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import data from "../assets/data.json";

const ANDROID_NOTIFICATION_DAYS = 90;
const ANDROID_NOTIFICATION_ID_START = 5000;
const ANDROID_TEST_NOTIFICATION_ID = 4999;

export type NotificationPayload = {
  title: string;
  body: string;
  route: string;
};

type Verse = {
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
};

const isElectron = () => Boolean(window.electronNotifications);

const showBrowserNotification = async (notification: NotificationPayload) => {
  if (!("Notification" in window)) return;

  if (Notification.permission === "default") {
    await Notification.requestPermission();
  }
  if (Notification.permission !== "granted") return;

  const browserNotification = new Notification(notification.title, {
    body: notification.body,
    tag: "zeitoon-verse-test",
  });
  browserNotification.onclick = () => {
    window.location.hash = notification.route;
    window.focus();
  };
};

const getRandomNotification = (): NotificationPayload => {
  const verse = (data[Math.floor(Math.random() * data.length)] as Verse);
  return {
    title: `آیه‌ای از ${verse.book_name}`,
    body: `${verse.text} (${verse.book_name} ${verse.chapter}:${verse.verse})`,
    route: `/${verse.book_name}/${verse.chapter}/${verse.verse}`,
  };
};

const cancelAndroidNotifications = async () => {
  const notificationCount = ANDROID_NOTIFICATION_DAYS * 24;
  await LocalNotifications.cancel({
    notifications: Array.from({ length: notificationCount }, (_, index) => ({
      id: ANDROID_NOTIFICATION_ID_START + index,
    })),
  });
};

const scheduleAndroidNotifications = async (intervalHours: number) => {
  const permission = await LocalNotifications.requestPermissions();
  if (permission.display !== "granted") return;

  await LocalNotifications.createChannel({
    id: "verse-reminders",
    name: "آیه‌های تصادفی",
    description: "یادآوری آیه‌های تصادفی",
    importance: 3,
  });

  await cancelAndroidNotifications();
  const firstNotificationAt = Date.now() + intervalHours * 60 * 60 * 1000;
  const notificationCount = Math.ceil((ANDROID_NOTIFICATION_DAYS * 24) / intervalHours);
  await LocalNotifications.schedule({
    notifications: Array.from({ length: notificationCount }, (_, index) => {
      const notification = getRandomNotification();
      return {
        id: ANDROID_NOTIFICATION_ID_START + index,
        title: notification.title,
        body: notification.body,
        largeBody: notification.body,
        summaryText: `${notification.title} - مشاهده آیه کامل`,
        extra: { route: notification.route },
        channelId: "verse-reminders",
        schedule: { at: new Date(firstNotificationAt + index * intervalHours * 60 * 60 * 1000) },
      };
    }),
  });
};

export const notifyRandomVerse = async () => {
  const notification = getRandomNotification();

  if (Capacitor.isNativePlatform()) {
    const permission = await LocalNotifications.requestPermissions();
    if (permission.display !== "granted") return;

    await LocalNotifications.createChannel({
      id: "verse-reminders",
      name: "آیه‌های تصادفی",
      description: "یادآوری آیه‌های تصادفی",
      importance: 3,
    });
    await LocalNotifications.schedule({
      notifications: [
        {
          id: ANDROID_TEST_NOTIFICATION_ID,
          title: notification.title,
          body: notification.body,
          largeBody: notification.body,
          summaryText: `${notification.title} - مشاهده آیه کامل`,
          extra: { route: notification.route },
          channelId: "verse-reminders",
        },
      ],
    });
    return;
  }

  if (isElectron()) {
    window.electronNotifications?.show(notification);
    return;
  }

  await showBrowserNotification(notification);
};

export const configureNotifications = async (
  enabled: boolean,
  intervalHours: number,
): Promise<(() => void) | undefined> => {
  if (Capacitor.isNativePlatform()) {
    if (enabled) await scheduleAndroidNotifications(intervalHours);
    else await cancelAndroidNotifications();
    return undefined;
  }

  if (!isElectron()) return undefined;
  const scheduledByWindows = await window.electronNotifications?.configure(enabled, intervalHours);
  if (scheduledByWindows) return undefined;
  if (!enabled) return undefined;

  const showNotification = () => window.electronNotifications?.show(getRandomNotification());
  const timer = window.setInterval(showNotification, intervalHours * 60 * 60 * 1000);
  return () => window.clearInterval(timer);
};

export const listenForNotificationClicks = (onClick: (route: string) => void) => {
  const electronCleanup = window.electronNotifications?.onClick(payload => onClick(payload.route));
  const capacitorListener = Capacitor.isNativePlatform()
    ? LocalNotifications.addListener("localNotificationActionPerformed", action => {
        const route = action.notification.extra?.route;
        if (route) onClick(route);
      })
    : undefined;

  return () => {
    electronCleanup?.();
    capacitorListener?.then(listener => listener.remove());
  };
};

export const getRandomNotificationForTest = getRandomNotification;
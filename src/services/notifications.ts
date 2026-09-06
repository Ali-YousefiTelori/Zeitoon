import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { getOneQuranSurahNames } from "../api";
import data from "../assets/data.json";

const ANDROID_MAX_SCHEDULED = 48;
const ANDROID_LEGACY_SCHEDULED = 90 * 24;
const ANDROID_NOTIFICATION_ID_START = 5000;
const ANDROID_TEST_NOTIFICATION_ID = 4999;
const ANDROID_CHANNEL_ID = "verse-reminders-persistent";

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

type ConfigureOptions = {
  showPreview?: boolean;
};

let nativeWork: Promise<void> = Promise.resolve();

const runNative = (task: () => Promise<void>) => {
  const next = nativeWork.then(task, task);
  nativeWork = next.then(
    () => undefined,
    () => undefined,
  );
  return next;
};

const isElectron = () => Boolean(window.electronNotifications);

const isOurNotificationId = (id: number) =>
  id === ANDROID_TEST_NOTIFICATION_ID ||
  (id >= ANDROID_NOTIFICATION_ID_START &&
    id < ANDROID_NOTIFICATION_ID_START + ANDROID_LEGACY_SCHEDULED);

const cancelInChunks = async (ids: { id: number }[]) => {
  const chunkSize = 100;
  for (let index = 0; index < ids.length; index += chunkSize) {
    await LocalNotifications.cancel({ notifications: ids.slice(index, index + chunkSize) });
  }
};

const showBrowserNotification = async (notification: NotificationPayload) => {
  if (!("Notification" in window)) return;

  if (Notification.permission === "default") {
    await Notification.requestPermission();
  }
  if (Notification.permission !== "granted") return;

  const browserNotification = new Notification(notification.title, {
    body: notification.body,
    tag: "zeitoon-verse-test",
    requireInteraction: true,
  });
  browserNotification.onclick = () => {
    window.location.hash = notification.route;
    window.focus();
  };
};

const formatVerseReference = (verse: Verse) => {
  const surahName = verse.book_name === "قرآن" ? ` ${getOneQuranSurahNames(verse.chapter)}` : "";
  return `${verse.book_name}${surahName} ${verse.chapter}:${verse.verse}`;
};

const getRandomNotification = (): NotificationPayload => {
  const verse = data[Math.floor(Math.random() * data.length)] as Verse;
  const surahName = verse.book_name === "قرآن" ? getOneQuranSurahNames(verse.chapter) : "";
  return {
    title: surahName ? `آیه‌ای از قرآن ${surahName}` : `آیه‌ای از ${verse.book_name}`,
    body: `${verse.text} (${formatVerseReference(verse)})`,
    route: `/${verse.book_name}/${verse.chapter}/${verse.verse}`,
  };
};

const toAndroidNotification = (
  notification: NotificationPayload,
  id: number,
  at?: Date,
) => ({
  id,
  title: notification.title,
  body: notification.body,
  largeBody: notification.body,
  summaryText: `${notification.title} - مشاهده آیه کامل`,
  extra: { route: notification.route },
  channelId: ANDROID_CHANNEL_ID,
  autoCancel: false,
  ...(at ? { schedule: { at, allowWhileIdle: true } } : {}),
});

const getDeliveredIds = async () => {
  try {
    const delivered = await LocalNotifications.getDeliveredNotifications();
    return new Set(delivered.notifications.map(item => item.id));
  } catch {
    return new Set<number>();
  }
};

const cancelPendingAndroidNotifications = async () => {
  const deliveredIds = await getDeliveredIds();
  try {
    const pending = await LocalNotifications.getPending();
    const toCancel = pending.notifications
      .filter(item => isOurNotificationId(item.id) && !deliveredIds.has(item.id))
      .map(item => ({ id: item.id }));
    await cancelInChunks(toCancel);
  } catch {
    const ids = Array.from({ length: ANDROID_LEGACY_SCHEDULED }, (_, index) => ({
      id: ANDROID_NOTIFICATION_ID_START + index,
    }));
    ids.push({ id: ANDROID_TEST_NOTIFICATION_ID });
    await cancelInChunks(ids.filter(item => !deliveredIds.has(item.id)));
  }
};

const removeOurDeliveredNotifications = async () => {
  try {
    const delivered = await LocalNotifications.getDeliveredNotifications();
    const ours = delivered.notifications.filter(item => isOurNotificationId(item.id));
    if (ours.length) {
      await LocalNotifications.removeDeliveredNotifications({ notifications: ours });
    }
  } catch {
    // Ignore if the device cannot list delivered notifications.
  }
};

const ensureAndroidChannel = async () => {
  await LocalNotifications.createChannel({
    id: ANDROID_CHANNEL_ID,
    name: "آیه‌های تصادفی",
    description: "یادآوری آیه‌های تصادفی",
    importance: 4,
    visibility: 1,
    vibration: true,
  });
};

const scheduleAndroidNotifications = async (intervalHours: number, showPreview: boolean) => {
  const permission = await LocalNotifications.requestPermissions();
  if (permission.display !== "granted") return;

  await ensureAndroidChannel();
  await cancelPendingAndroidNotifications();

  const deliveredIds = await getDeliveredIds();
  const safeIntervalHours = Math.max(1, intervalHours);
  const firstNotificationAt = Date.now() + safeIntervalHours * 60 * 60 * 1000;
  const notifications = [];
  let nextId = ANDROID_NOTIFICATION_ID_START;

  for (let index = 0; index < ANDROID_MAX_SCHEDULED; index += 1) {
    while (deliveredIds.has(nextId)) nextId += 1;
    deliveredIds.add(nextId);
    notifications.push(
      toAndroidNotification(
        getRandomNotification(),
        nextId,
        new Date(firstNotificationAt + index * safeIntervalHours * 60 * 60 * 1000),
      ),
    );
    nextId += 1;
  }

  const chunkSize = 16;
  for (let index = 0; index < notifications.length; index += chunkSize) {
    await LocalNotifications.schedule({
      notifications: notifications.slice(index, index + chunkSize),
    });
  }

  if (showPreview && !deliveredIds.has(ANDROID_TEST_NOTIFICATION_ID)) {
    await LocalNotifications.schedule({
      notifications: [
        toAndroidNotification(
          getRandomNotification(),
          ANDROID_TEST_NOTIFICATION_ID,
          new Date(Date.now() + 1500),
        ),
      ],
    });
  }
};

export const notifyRandomVerse = async () => {
  const notification = getRandomNotification();

  if (Capacitor.isNativePlatform()) {
    await runNative(async () => {
      const permission = await LocalNotifications.requestPermissions();
      if (permission.display !== "granted") return;

      await ensureAndroidChannel();
      await LocalNotifications.schedule({
        notifications: [
          toAndroidNotification(
            notification,
            ANDROID_TEST_NOTIFICATION_ID,
            new Date(Date.now() + 1500),
          ),
        ],
      });
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
  options: ConfigureOptions = {},
): Promise<(() => void) | undefined> => {
  if (Capacitor.isNativePlatform()) {
    await runNative(async () => {
      try {
        if (enabled) await scheduleAndroidNotifications(intervalHours, Boolean(options.showPreview));
        else {
          await cancelPendingAndroidNotifications();
          await removeOurDeliveredNotifications();
        }
      } catch {
        // Native binder crashes cannot be caught; keep JS from failing app startup.
      }
    });
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

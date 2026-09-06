const { app, BrowserWindow, Notification, ipcMain } = require("electron");
const { execFile } = require("child_process");
const fs = require("fs");
const path = require("path");

const WINDOWS_TASK_NAME = "Zeitoon Verse Reminder";
const getQuranSurahName = chapter => {
  const surahNamesPath = path.join(app.getAppPath(), "src", "assets", "surah-names.json");
  const surahNames = JSON.parse(fs.readFileSync(surahNamesPath, "utf8"));
  return surahNames[chapter - 1] || "";
};

const getRandomNotification = () => {
  const dataPath = path.join(app.getAppPath(), "src", "assets", "data.json");
  const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  const verse = data[Math.floor(Math.random() * data.length)];
  const surahName = verse.book_name === "قرآن" ? getQuranSurahName(verse.chapter) : "";
  const reference = surahName
    ? `${verse.book_name} ${surahName} ${verse.chapter}:${verse.verse}`
    : `${verse.book_name} ${verse.chapter}:${verse.verse}`;
  return {
    title: surahName ? `آیه‌ای از قرآن ${surahName}` : `آیه‌ای از ${verse.book_name}`,
    body: `${verse.text} (${reference})`,
    route: `/${verse.book_name}/${verse.chapter}/${verse.verse}`,
  };
};

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadURL(
    process.env.ELECTRON_START_URL || `file://${path.join(__dirname, "build", "index.html")}`,
  );
}

ipcMain.on("show-notification", (_event, payload) => {
  const notification = new Notification({
    title: payload.title,
    body: payload.body,
  });
  notification.on("click", () => {
    const window = BrowserWindow.getAllWindows()[0];
    if (!window) return;
    if (window.isMinimized()) window.restore();
    window.show();
    window.focus();
    window.webContents.send("notification-clicked", payload);
  });
  notification.show();
});

ipcMain.handle("configure-notification-schedule", async (_event, { enabled, intervalHours }) => {
  if (process.platform !== "win32" || !app.isPackaged) return false;

  if (!enabled) {
    await new Promise(resolve =>
      execFile("schtasks.exe", ["/Delete", "/TN", WINDOWS_TASK_NAME, "/F"], () => resolve()),
    );
    return true;
  }

  const executable = process.execPath;
  await new Promise((resolve, reject) => {
    execFile(
      "schtasks.exe",
      [
        "/Create",
        "/SC",
        "HOURLY",
        "/MO",
        String(intervalHours),
        "/TN",
        WINDOWS_TASK_NAME,
        "/TR",
        `"${executable}" --zeitoon-notification`,
        "/F",
      ],
      error => (error ? reject(error) : resolve()),
    );
  });
  return true;
});

app.on("ready", () => {
  createWindow();
  if (process.argv.includes("--zeitoon-notification")) {
    const notification = getRandomNotification();
    new Notification(notification).show();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

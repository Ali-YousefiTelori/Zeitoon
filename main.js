const { app, BrowserWindow, Notification, ipcMain } = require("electron");
const { execFile } = require("child_process");
const fs = require("fs");
const path = require("path");
const https = require("https");
const { pathToFileURL } = require("url");

const WINDOWS_TASK_NAME = "Zeitoon Verse Reminder";
const activeAudioDownloads = new Map();
const audioDirectory = () => path.join(app.getPath("userData"), "audio");
const audioFilePath = key => path.join(audioDirectory(), `${encodeURIComponent(key)}.mp3`);
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

ipcMain.handle("get-local-audio-url", async (_event, { key }) => {
  const filePath = audioFilePath(key);
  return fs.existsSync(filePath) ? pathToFileURL(filePath).toString() : null;
});

ipcMain.handle("delete-audio", async (_event, { key }) => {
  await fs.promises.rm(audioFilePath(key), { force: true });
});

ipcMain.handle("download-audio", async (event, { url, key, jobId }) => {
  await fs.promises.mkdir(audioDirectory(), { recursive: true });
  const destination = audioFilePath(key);
  const temporary = `${destination}.download`;

  await new Promise((resolve, reject) => {
    let request;
    let output;
    let settled = false;
    const finish = (error, value) => {
      if (settled) return;
      settled = true;
      activeAudioDownloads.delete(jobId);
      if (error) {
        fs.rm(temporary, { force: true }, () => reject(error));
      } else {
        resolve(value);
      }
    };

    const cancel = () => {
      request?.destroy();
      output?.destroy();
      finish(new Error("AUDIO_DOWNLOAD_CANCELLED"));
    };
    activeAudioDownloads.set(jobId, { cancel });

    request = https.get(url, response => {
      if (response.statusCode !== 200) {
        response.resume();
        finish(new Error(`Audio download failed (${response.statusCode})`));
        return;
      }
      const total = Number(response.headers["content-length"]) || 0;
      let loaded = 0;
      output = fs.createWriteStream(temporary);
      response.on("data", chunk => {
        loaded += chunk.length;
        event.sender.send("audio-download-progress", {
          jobId,
          progress: total ? loaded / total : 0,
        });
      });
      response.pipe(output);
      output.on("finish", () => output.close(() => {
        fs.rename(temporary, destination, error =>
          error ? finish(error) : finish(null),
        );
      }));
      output.on("error", finish);
    });
    request.on("error", finish);
  });
});

ipcMain.handle("cancel-audio-download", async (_event, { jobId }) => {
  activeAudioDownloads.get(jobId)?.cancel();
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

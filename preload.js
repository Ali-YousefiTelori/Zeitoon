const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronNotifications", {
  show: payload => ipcRenderer.send("show-notification", payload),
  configure: (enabled, intervalHours) =>
    ipcRenderer.invoke("configure-notification-schedule", { enabled, intervalHours }),
  onClick: callback => {
    const handler = (_event, payload) => callback(payload);
    ipcRenderer.on("notification-clicked", handler);
    return () => ipcRenderer.removeListener("notification-clicked", handler);
  },
});

contextBridge.exposeInMainWorld("electronAudio", {
  download: (url, key, jobId) => ipcRenderer.invoke("download-audio", { url, key, jobId }),
  cancelDownload: jobId => ipcRenderer.invoke("cancel-audio-download", { jobId }),
  delete: key => ipcRenderer.invoke("delete-audio", { key }),
  onProgress: (jobId, callback) => {
    const handler = (_event, payload) => {
      if (payload.jobId === jobId) callback(payload.progress);
    };
    ipcRenderer.on("audio-download-progress", handler);
    return () => ipcRenderer.removeListener("audio-download-progress", handler);
  },
  getLocalUrl: key => ipcRenderer.invoke("get-local-audio-url", { key }),
});

window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const dependency of ["chrome", "node", "electron"]) {
    replaceText(`${dependency}-version`, process.versions[dependency]);
  }
});

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

window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const dependency of ["chrome", "node", "electron"]) {
    replaceText(`${dependency}-version`, process.versions[dependency]);
  }
});

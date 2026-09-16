import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then(registration => {
        const notifyUpdate = () => {
          if (registration.waiting) {
            window.dispatchEvent(new Event("pwa-update-available"));
          }
        };

        notifyUpdate();
        registration.addEventListener("updatefound", () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.addEventListener("statechange", () => {
            if (installingWorker.state === "installed") notifyUpdate();
          });
        });
      })
      .catch(error => {
        console.error("Service worker registration failed:", error);
      });
  });
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

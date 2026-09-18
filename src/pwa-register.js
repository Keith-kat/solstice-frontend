/**
 * Import this once from your app's entry point (e.g. main.jsx / index.js):
 *
 *   import "./pwa-register";
 *
 * and add to index.html's <head>:
 *
 *   <link rel="manifest" href="/manifest.json">
 *   <meta name="theme-color" content="#1C2B45">
 *
 * Copy manifest.json and service-worker.js into your public/ folder so
 * they're served from the site root (not bundled by the JS build).
 */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .catch((err) => console.warn("Solstice service worker registration failed:", err));
  });
}

const { app, BrowserWindow, ipcMain, shell } = require("electron");
const { autoUpdater } = require("electron-updater");
const log = require("electron-log");
const path = require("path");
const store = require("./store.cjs");

autoUpdater.logger = log;
log.transports.file.level = "info";

const isDev = process.env.NODE_ENV === "development";

const OVERLAY_LIGHT = { color: "#fbfaf7", symbolColor: "#374151", height: 32 };
const OVERLAY_DARK  = { color: "#0f111a", symbolColor: "#d1d5db", height: 32 };

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: "#fbfaf7",
    autoHideMenuBar: true,
    titleBarStyle: "hidden",
    titleBarOverlay: OVERLAY_LIGHT,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  if (!isDev) {
    mainWindow.webContents.once("did-finish-load", () => {
      setTimeout(() => autoUpdater.checkForUpdates(), 3000);
    });
  }
}

autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = false;

autoUpdater.on("error", (err) => {
  console.error("[updater] error:", err.message);
});

autoUpdater.on("checking-for-update", () => console.log("[updater] checking..."));
autoUpdater.on("update-not-available", () => console.log("[updater] no update available"));

autoUpdater.on("update-available", () => {
  console.log("[updater] update available");
  mainWindow?.webContents.send("updater:update-available");
});

autoUpdater.on("download-progress", (progress) => {
  mainWindow?.webContents.send("updater:download-progress", Math.round(progress.percent));
});

let updateReady = false;

autoUpdater.on("update-downloaded", () => {
  updateReady = true;
  mainWindow?.webContents.send("updater:update-ready");
});

app.whenReady().then(() => {
  store.init();
  store.processRenewals();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

/* ---------------------------------------------------------------- */
/* IPC: rate limiter                                                */
/* ---------------------------------------------------------------- */

// Sliding window rate limiter: rejects calls exceeding `limit` per `windowMs`.
function rateLimitedHandle(channel, handler, limit = 20, windowMs = 1000) {
  const timestamps = [];
  ipcMain.handle(channel, (event, ...args) => {
    const now = Date.now();
    while (timestamps.length > 0 && now - timestamps[0] > windowMs) timestamps.shift();
    if (timestamps.length >= limit) throw new Error("Rate limit exceeded");
    timestamps.push(now);
    return handler(event, ...args);
  });
}

/* ---------------------------------------------------------------- */
/* IPC: data layer                                                  */
/* ---------------------------------------------------------------- */

ipcMain.on("updater:quit-and-install", () => autoUpdater.quitAndInstall());
ipcMain.handle("updater:getStatus", () => updateReady ? "ready" : null);
ipcMain.handle("updater:checkNow", async () => {
  try {
    const result = await autoUpdater.checkForUpdates();
    return { success: true, version: result?.updateInfo?.version ?? null };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle("ui:setTitleBarOverlay", (_e, isDark) => {
  mainWindow?.setTitleBarOverlay(isDark ? OVERLAY_DARK : OVERLAY_LIGHT);
});

rateLimitedHandle("data:getAll", () => store.getAll(), 30);

rateLimitedHandle("data:addCategory", (_e, category) => store.addCategory(category));
rateLimitedHandle("data:updateCategory", (_e, id, patch) => store.updateCategory(id, patch));
rateLimitedHandle("data:deleteCategory", (_e, id) => store.deleteCategory(id));

rateLimitedHandle("data:addTransaction", (_e, tx) => store.addTransaction(tx));
rateLimitedHandle("data:updateTransaction", (_e, id, patch) => store.updateTransaction(id, patch));
rateLimitedHandle("data:deleteTransaction", (_e, id) => store.deleteTransaction(id));

rateLimitedHandle("data:addGoal", (_e, goal) => store.addGoal(goal));
rateLimitedHandle("data:updateGoal", (_e, id, patch) => store.updateGoal(id, patch));
rateLimitedHandle("data:deleteGoal", (_e, id) => store.deleteGoal(id));
rateLimitedHandle("data:contributeGoal", (_e, id, amount) => store.contributeGoal(id, amount));

rateLimitedHandle("data:addSubscription", (_e, sub) => store.addSubscription(sub));
rateLimitedHandle("data:updateSubscription", (_e, id, patch) => store.updateSubscription(id, patch));
rateLimitedHandle("data:deleteSubscription", (_e, id) => store.deleteSubscription(id));

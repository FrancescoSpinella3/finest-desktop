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
      sandbox: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }

  mainWindow.webContents.on("before-input-event", (_e, input) => {
    if (input.control && input.shift && input.key.toLowerCase() === "i") {
      mainWindow.webContents.openDevTools({ mode: "detach" });
    }
  });

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
autoUpdater.autoInstallOnAppQuit = true;

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

ipcMain.handle("data:getAll", () => store.getAll());

ipcMain.handle("data:addCategory", (_e, category) => store.addCategory(category));
ipcMain.handle("data:updateCategory", (_e, id, patch) => store.updateCategory(id, patch));
ipcMain.handle("data:deleteCategory", (_e, id) => store.deleteCategory(id));

ipcMain.handle("data:addTransaction", (_e, tx) => store.addTransaction(tx));
ipcMain.handle("data:updateTransaction", (_e, id, patch) => store.updateTransaction(id, patch));
ipcMain.handle("data:deleteTransaction", (_e, id) => store.deleteTransaction(id));

ipcMain.handle("data:addGoal", (_e, goal) => store.addGoal(goal));
ipcMain.handle("data:updateGoal", (_e, id, patch) => store.updateGoal(id, patch));
ipcMain.handle("data:deleteGoal", (_e, id) => store.deleteGoal(id));
ipcMain.handle("data:contributeGoal", (_e, id, amount) => store.contributeGoal(id, amount));

ipcMain.handle("data:addSubscription", (_e, sub) => store.addSubscription(sub));
ipcMain.handle("data:updateSubscription", (_e, id, patch) => store.updateSubscription(id, patch));
ipcMain.handle("data:deleteSubscription", (_e, id) => store.deleteSubscription(id));

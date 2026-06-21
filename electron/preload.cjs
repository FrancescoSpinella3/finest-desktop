const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  getAll: () => ipcRenderer.invoke("data:getAll"),

  addCategory: (category) => ipcRenderer.invoke("data:addCategory", category),
  updateCategory: (id, patch) => ipcRenderer.invoke("data:updateCategory", id, patch),
  deleteCategory: (id) => ipcRenderer.invoke("data:deleteCategory", id),

  addTransaction: (tx) => ipcRenderer.invoke("data:addTransaction", tx),
  updateTransaction: (id, patch) => ipcRenderer.invoke("data:updateTransaction", id, patch),
  deleteTransaction: (id) => ipcRenderer.invoke("data:deleteTransaction", id),

  addGoal: (goal) => ipcRenderer.invoke("data:addGoal", goal),
  updateGoal: (id, patch) => ipcRenderer.invoke("data:updateGoal", id, patch),
  deleteGoal: (id) => ipcRenderer.invoke("data:deleteGoal", id),
  contributeGoal: (id, amount) => ipcRenderer.invoke("data:contributeGoal", id, amount),

  addSubscription: (sub) => ipcRenderer.invoke("data:addSubscription", sub),
  updateSubscription: (id, patch) => ipcRenderer.invoke("data:updateSubscription", id, patch),
  deleteSubscription: (id) => ipcRenderer.invoke("data:deleteSubscription", id),

  setTitleBarOverlay: (isDark) => ipcRenderer.invoke("ui:setTitleBarOverlay", isDark),
});

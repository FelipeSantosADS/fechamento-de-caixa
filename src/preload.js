const { contextBridge, ipcRenderer } = require("electron")

console.log("Preload script carregado")

// Expor APIs seguras para o renderer
contextBridge.exposeInMainWorld("electronAPI", {
  // Operações de dados
  saveData: (key, data) => ipcRenderer.invoke("save-data", key, data),
  loadData: (key) => ipcRenderer.invoke("load-data", key),

  // Sistema
  openDataFolder: () => ipcRenderer.invoke("open-data-folder"),
  getSystemInfo: () => ipcRenderer.invoke("get-system-info"),
})

console.log("APIs expostas com sucesso")

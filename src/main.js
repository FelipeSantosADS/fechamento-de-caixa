const { app, BrowserWindow, ipcMain, dialog, shell } = require("electron")
const path = require("path")
const fs = require("fs")
const os = require("os")

// Definir pasta de dados
const DATA_FOLDER = path.join(os.homedir(), "Documents", "PostoGasolina_Dados")

let mainWindow

function createWindow() {
  console.log("Criando janela principal...")

  // Criar a janela principal
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    show: false,
    titleBarStyle: "default",
  })

  // Carregar o arquivo HTML
  mainWindow.loadFile(path.join(__dirname, "index.html"))

  // Mostrar janela quando estiver pronta
  mainWindow.once("ready-to-show", () => {
    mainWindow.show()
    console.log("Janela exibida com sucesso!")

    // Criar pasta de dados se não existir
    ensureDataFolder()
  })

  // Abrir DevTools se for modo dev
  if (process.argv.includes("--dev")) {
    mainWindow.webContents.openDevTools()
    console.log("DevTools aberto (modo desenvolvimento)")
  }
}

// Garantir que a pasta de dados existe
function ensureDataFolder() {
  try {
    if (!fs.existsSync(DATA_FOLDER)) {
      fs.mkdirSync(DATA_FOLDER, { recursive: true })
    }
    console.log(`Pasta de dados verificada: ${DATA_FOLDER}`)
  } catch (error) {
    console.error("Erro ao criar pasta de dados:", error)
  }
}

// Quando o Electron terminar de inicializar
app.whenReady().then(() => {
  console.log("Electron inicializado")
  createWindow()
})

// Sair quando todas as janelas forem fechadas
app.on("window-all-closed", () => {
  console.log("Todas as janelas fechadas")
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("activate", () => {
  console.log("App ativado")
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// IPC Handlers básicos

// Salvar dados
ipcMain.handle("save-data", async (event, key, data) => {
  try {
    const filePath = path.join(DATA_FOLDER, `${key}.json`)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    console.log(`Dados salvos: ${key}`)
    return { success: true }
  } catch (error) {
    console.error("Erro ao salvar dados:", error)
    return { success: false, error: error.message }
  }
})

// Carregar dados
ipcMain.handle("load-data", async (event, key) => {
  try {
    const filePath = path.join(DATA_FOLDER, `${key}.json`)

    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, "utf8"))
      console.log(`Dados carregados: ${key}`)
      return { success: true, data }
    } else {
      console.log(`Arquivo não encontrado: ${key}`)
      return { success: true, data: null }
    }
  } catch (error) {
    console.error("Erro ao carregar dados:", error)
    return { success: false, error: error.message }
  }
})

// Abrir pasta de dados
ipcMain.handle("open-data-folder", async () => {
  try {
    shell.openPath(DATA_FOLDER)
    console.log("Pasta de dados aberta")
    return { success: true }
  } catch (error) {
    console.error("Erro ao abrir pasta:", error)
    return { success: false, error: error.message }
  }
})

// Obter informações do sistema
ipcMain.handle("get-system-info", async () => {
  return {
    dataFolder: DATA_FOLDER,
    platform: process.platform,
    version: app.getVersion(),
    electronVersion: process.versions.electron,
  }
})

console.log("Main process iniciado")

// Sistema de armazenamento local para a versão web
class WebStorage {
  constructor() {
    this.prefix = "posto_gasolina_"
    this.init()
  }

  init() {
    // Verificar se localStorage está disponível
    if (!this.isLocalStorageAvailable()) {
      console.warn("localStorage não disponível, usando armazenamento temporário")
      this.fallbackStorage = new Map()
    }
  }

  isLocalStorageAvailable() {
    try {
      const test = "__storage_test__"
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch (e) {
      return false
    }
  }

  // Salvar dados
  async saveData(key, data) {
    try {
      const fullKey = this.prefix + key
      const jsonData = JSON.stringify(data)

      if (this.isLocalStorageAvailable()) {
        localStorage.setItem(fullKey, jsonData)
      } else {
        this.fallbackStorage.set(fullKey, jsonData)
      }

      console.log(`Dados salvos: ${key}`)
      return { success: true }
    } catch (error) {
      console.error("Erro ao salvar dados:", error)
      return { success: false, error: error.message }
    }
  }

  // Carregar dados
  async loadData(key) {
    try {
      const fullKey = this.prefix + key
      let jsonData

      if (this.isLocalStorageAvailable()) {
        jsonData = localStorage.getItem(fullKey)
      } else {
        jsonData = this.fallbackStorage.get(fullKey)
      }

      if (jsonData) {
        const data = JSON.parse(jsonData)
        console.log(`Dados carregados: ${key}`)
        return { success: true, data }
      } else {
        console.log(`Dados não encontrados: ${key}`)
        return { success: true, data: null }
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
      return { success: false, error: error.message }
    }
  }

  // Deletar dados
  async deleteData(key) {
    try {
      const fullKey = this.prefix + key

      if (this.isLocalStorageAvailable()) {
        localStorage.removeItem(fullKey)
      } else {
        this.fallbackStorage.delete(fullKey)
      }

      console.log(`Dados deletados: ${key}`)
      return { success: true }
    } catch (error) {
      console.error("Erro ao deletar dados:", error)
      return { success: false, error: error.message }
    }
  }

  // Listar todas as chaves
  async listKeys() {
    try {
      const keys = []

      if (this.isLocalStorageAvailable()) {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith(this.prefix)) {
            keys.push(key.replace(this.prefix, ""))
          }
        }
      } else {
        for (const key of this.fallbackStorage.keys()) {
          if (key.startsWith(this.prefix)) {
            keys.push(key.replace(this.prefix, ""))
          }
        }
      }

      return { success: true, keys }
    } catch (error) {
      console.error("Erro ao listar chaves:", error)
      return { success: false, error: error.message }
    }
  }

  // Exportar todos os dados
  async exportAllData() {
    try {
      const allData = {}
      const { keys } = await this.listKeys()

      for (const key of keys) {
        const result = await this.loadData(key)
        if (result.success && result.data) {
          allData[key] = result.data
        }
      }

      return {
        success: true,
        data: {
          exportDate: new Date().toISOString(),
          version: "1.0.0",
          data: allData,
        },
      }
    } catch (error) {
      console.error("Erro ao exportar dados:", error)
      return { success: false, error: error.message }
    }
  }

  // Importar dados
  async importData(importData) {
    try {
      if (!importData.data) {
        throw new Error("Formato de dados inválido")
      }

      for (const [key, data] of Object.entries(importData.data)) {
        await this.saveData(key, data)
      }

      return { success: true }
    } catch (error) {
      console.error("Erro ao importar dados:", error)
      return { success: false, error: error.message }
    }
  }

  // Obter informações de armazenamento
  getStorageInfo() {
    const info = {
      type: this.isLocalStorageAvailable() ? "localStorage" : "memory",
      available: this.isLocalStorageAvailable(),
      prefix: this.prefix,
    }

    if (this.isLocalStorageAvailable()) {
      try {
        // Calcular uso aproximado do localStorage
        let totalSize = 0
        for (const key in localStorage) {
          if (localStorage.hasOwnProperty(key)) {
            totalSize += localStorage[key].length + key.length
          }
        }
        info.totalSize = totalSize
        info.sizeFormatted = this.formatBytes(totalSize)
      } catch (e) {
        info.totalSize = "unknown"
      }
    }

    return info
  }

  formatBytes(bytes) {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Limpar todos os dados do app
  async clearAllData() {
    try {
      const { keys } = await this.listKeys()

      for (const key of keys) {
        await this.deleteData(key)
      }

      return { success: true }
    } catch (error) {
      console.error("Erro ao limpar dados:", error)
      return { success: false, error: error.message }
    }
  }
}

// Instância global
window.webStorage = new WebStorage()

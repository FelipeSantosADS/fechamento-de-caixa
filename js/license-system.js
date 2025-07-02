// Sistema de Licenciamento e Ativação
class LicenseSystem {
  constructor() {
    this.licenseServer = "https://api.seudominio.com/license" // Substitua pela sua API
    this.deviceId = this.generateDeviceId()
    this.licenseKey = null
    this.licenseStatus = "inactive"
    this.init()
  }

  async init() {
    await this.loadLicense()
    await this.validateLicense()
  }

  // Gerar ID único do dispositivo
  generateDeviceId() {
    let deviceId = localStorage.getItem("device_id")
    if (!deviceId) {
      deviceId = "dev_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
      localStorage.setItem("device_id", deviceId)
    }
    return deviceId
  }

  // Carregar licença salva
  async loadLicense() {
    try {
      const result = await window.webStorage.loadData("license")
      if (result.success && result.data) {
        this.licenseKey = result.data.key
        this.licenseStatus = result.data.status
        this.licenseExpiry = result.data.expiry
        this.licenseFeatures = result.data.features
      }
    } catch (error) {
      console.error("Erro ao carregar licença:", error)
    }
  }

  // Salvar licença
  async saveLicense(licenseData) {
    try {
      await window.webStorage.saveData("license", licenseData)
      this.licenseKey = licenseData.key
      this.licenseStatus = licenseData.status
      this.licenseExpiry = licenseData.expiry
      this.licenseFeatures = licenseData.features
    } catch (error) {
      console.error("Erro ao salvar licença:", error)
    }
  }

  // Validar licença no servidor
  async validateLicense() {
    if (!this.licenseKey) return false

    try {
      // Simulação de validação (substitua por chamada real à API)
      const response = await this.mockLicenseValidation()

      if (response.valid) {
        this.licenseStatus = "active"
        this.licenseExpiry = response.expiry
        this.licenseFeatures = response.features
        return true
      } else {
        this.licenseStatus = "invalid"
        return false
      }
    } catch (error) {
      console.error("Erro ao validar licença:", error)
      return false
    }
  }

  // Simulação de validação (substitua por API real)
  async mockLicenseValidation() {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simular resposta do servidor
        resolve({
          valid: this.licenseKey && this.licenseKey.length > 10,
          expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          features: ["premium", "unlimited_employees", "cloud_backup"],
        })
      }, 1000)
    })
  }

  // Ativar licença com chave
  async activateLicense(licenseKey) {
    try {
      // Validar formato da chave
      if (!this.isValidLicenseFormat(licenseKey)) {
        throw new Error("Formato de licença inválido")
      }

      // Enviar para servidor para ativação
      const response = await this.activateOnServer(licenseKey)

      if (response.success) {
        await this.saveLicense({
          key: licenseKey,
          status: "active",
          expiry: response.expiry,
          features: response.features,
          activatedAt: new Date().toISOString(),
          deviceId: this.deviceId,
        })

        return { success: true, message: "Licença ativada com sucesso!" }
      } else {
        throw new Error(response.message || "Erro ao ativar licença")
      }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  // Validar formato da chave de licença
  isValidLicenseFormat(key) {
    // Formato: XXXX-XXXX-XXXX-XXXX
    const pattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/
    return pattern.test(key)
  }

  // Ativar no servidor (simulação)
  async activateOnServer(licenseKey) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simular ativação no servidor
        const validKeys = ["DEMO-2024-PREM-0001", "TEST-2024-BASI-0001", "PROD-2024-ENTP-0001"]

        if (validKeys.includes(licenseKey)) {
          resolve({
            success: true,
            expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            features: ["premium", "unlimited_employees", "cloud_backup", "priority_support"],
          })
        } else {
          resolve({
            success: false,
            message: "Chave de licença inválida ou já utilizada",
          })
        }
      }, 2000)
    })
  }

  // Verificar se licença está ativa
  isLicenseActive() {
    if (this.licenseStatus !== "active") return false
    if (!this.licenseExpiry) return false

    return new Date() < new Date(this.licenseExpiry)
  }

  // Verificar se tem funcionalidade específica
  hasFeature(feature) {
    if (!this.isLicenseActive()) return false
    return this.licenseFeatures && this.licenseFeatures.includes(feature)
  }

  // Mostrar modal de ativação
  showActivationModal() {
    const modal = document.createElement("div")
    modal.className = "modal"
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title">🔑 Ativar Licença</h2>
          <button onclick="this.closest('.modal').remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">×</button>
        </div>
        
        <div class="license-info">
          <p>Digite sua chave de licença para ativar o sistema:</p>
        </div>
        
        <form id="licenseForm" onsubmit="licenseSystem.handleActivation(event)">
          <div class="form-group">
            <label class="form-label">Chave de Licença:</label>
            <input type="text" 
                   class="form-input license-input" 
                   id="licenseKey" 
                   placeholder="XXXX-XXXX-XXXX-XXXX"
                   maxlength="19"
                   style="font-family: monospace; text-align: center; text-transform: uppercase;"
                   required>
            <small class="form-help">Formato: XXXX-XXXX-XXXX-XXXX</small>
          </div>
          
          <div class="license-examples">
            <h4>Chaves de Demonstração:</h4>
            <div class="demo-keys">
              <code onclick="licenseSystem.fillDemoKey('DEMO-2024-PREM-0001')">DEMO-2024-PREM-0001</code>
              <code onclick="licenseSystem.fillDemoKey('TEST-2024-BASI-0001')">TEST-2024-BASI-0001</code>
              <code onclick="licenseSystem.fillDemoKey('PROD-2024-ENTP-0001')">PROD-2024-ENTP-0001</code>
            </div>
          </div>
          
          <button type="submit" class="btn btn-primary btn-lg" style="width: 100%;" id="activateBtn">
            🔑 Ativar Licença
          </button>
        </form>
        
        <div class="purchase-info">
          <hr style="margin: 2rem 0;">
          <h4>Não tem uma licença?</h4>
          <p>Adquira sua licença oficial:</p>
          <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
            <button class="btn btn-success" onclick="licenseSystem.showPurchaseOptions()">
              💳 Comprar Licença
            </button>
            <button class="btn" onclick="licenseSystem.requestTrial()">
              🆓 Solicitar Teste
            </button>
          </div>
        </div>
      </div>
    `

    document.body.appendChild(modal)

    // Adicionar formatação automática da chave
    const input = document.getElementById("licenseKey")
    input.addEventListener("input", this.formatLicenseKey)
  }

  // Formatar chave de licença automaticamente
  formatLicenseKey(event) {
    const value = event.target.value.replace(/[^A-Z0-9]/g, "")
    let formatted = ""

    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += "-"
      }
      formatted += value[i]
    }

    event.target.value = formatted
  }

  // Preencher chave de demonstração
  fillDemoKey(key) {
    const input = document.getElementById("licenseKey")
    if (input) {
      input.value = key
    }
  }

  // Processar ativação
  async handleActivation(event) {
    event.preventDefault()

    const licenseKey = document.getElementById("licenseKey").value
    const activateBtn = document.getElementById("activateBtn")

    // Mostrar loading
    activateBtn.disabled = true
    activateBtn.innerHTML = "⏳ Ativando..."

    try {
      const result = await this.activateLicense(licenseKey)

      if (result.success) {
        if (window.app) {
          window.app.showNotification(result.message, "success")
        }

        // Fechar modal
        document.querySelector(".modal").remove()

        // Recarregar página
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      if (window.app) {
        window.app.showNotification(error.message, "error")
      }
    } finally {
      activateBtn.disabled = false
      activateBtn.innerHTML = "🔑 Ativar Licença"
    }
  }

  // Mostrar opções de compra
  showPurchaseOptions() {
    if (window.app) {
      window.app.showNotification("Redirecionando para loja...", "info")
    }

    // Redirecionar para página de vendas
    setTimeout(() => {
      window.open("https://seusite.com/comprar", "_blank")
    }, 1000)
  }

  // Solicitar teste
  async requestTrial() {
    try {
      // Gerar chave de teste temporária
      const trialKey = "TRIAL-" + Date.now().toString().substr(-8)

      await this.saveLicense({
        key: trialKey,
        status: "trial",
        expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        features: ["basic"],
        activatedAt: new Date().toISOString(),
        deviceId: this.deviceId,
      })

      if (window.app) {
        window.app.showNotification("Teste de 7 dias ativado!", "success")
      }

      // Fechar modal e recarregar
      document.querySelector(".modal").remove()
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      if (window.app) {
        window.app.showNotification("Erro ao ativar teste", "error")
      }
    }
  }

  // Obter informações da licença
  getLicenseInfo() {
    return {
      key: this.licenseKey,
      status: this.licenseStatus,
      isActive: this.isLicenseActive(),
      expiry: this.licenseExpiry,
      features: this.licenseFeatures,
      deviceId: this.deviceId,
      daysLeft: this.licenseExpiry ? Math.ceil((new Date(this.licenseExpiry) - new Date()) / (1000 * 60 * 60 * 24)) : 0,
    }
  }

  // Verificar expiração
  checkExpiration() {
    if (this.isLicenseActive()) return

    if (this.licenseKey && this.licenseStatus === "active") {
      // Licença expirada
      if (window.app) {
        window.app.showNotification("⚠️ Licença expirada! Renove para continuar usando.", "warning")
      }
      this.showActivationModal()
    } else if (!this.licenseKey) {
      // Sem licença
      this.showActivationModal()
    }
  }
}

// CSS para sistema de licença
const licenseCSS = `
<style>
.license-input {
  font-size: 1.2rem !important;
  letter-spacing: 2px;
}

.form-help {
  color: var(--text-secondary);
  font-size: 0.75rem;
  margin-top: 0.25rem;
  display: block;
}

.license-examples {
  background: var(--background);
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  text-align: center;
}

.demo-keys {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.demo-keys code {
  background: var(--surface);
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid var(--border);
}

.demo-keys code:hover {
  background: var(--primary-color);
  color: white;
}

.purchase-info {
  text-align: center;
}

.purchase-info h4 {
  margin-bottom: 0.5rem;
}

.purchase-info p {
  color: var(--text-secondary);
  margin-bottom: 1rem;
}
</style>
`

// Adicionar CSS
document.head.insertAdjacentHTML("beforeend", licenseCSS)

// Instância global
window.licenseSystem = new LicenseSystem()

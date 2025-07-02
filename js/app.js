// Sistema de Fechamento de Caixa - Versão Web
class PostoCaixaWebApp {
  constructor() {
    this.currentEmployee = null
    this.employees = []
    this.savedDays = []
    this.selectedDate = new Date()
    this.selectedShift = "manha"
    this.isLoading = true

    // Dados do formulário
    this.formData = {
      cashDeposits: 0,
      pix: 0,
      vouchers: 0,
      products: 0,
      system: 0,
      cardAmounts: {
        master: { debit: 0, credit: 0 },
        visa: { debit: 0, credit: 0 },
        elo: { debit: 0, credit: 0 },
        amex: { debit: 0, credit: 0 },
        others: { debit: 0, credit: 0 },
      },
    }

    this.init()
  }

  async init() {
    try {
      console.log("Iniciando aplicação web...")
      this.updateStatus("Carregando sistema...")

      // Simular carregamento
      await this.sleep(2000)

      // Carregar dados
      await this.loadEmployees()

      // Verificar status online
      this.setupOnlineStatus()

      // Inicializar interface
      this.initializeUI()

      // Esconder loading e mostrar app
      document.getElementById("loading").style.display = "none"
      document.getElementById("main-content").style.display = "block"

      this.isLoading = false
      this.updateStatus("Sistema carregado - Dados salvos no navegador")
    } catch (error) {
      console.error("Erro na inicialização:", error)
      this.showNotification("Erro ao inicializar o sistema", "error")
    }
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  async loadEmployees() {
    try {
      const result = await window.webStorage.loadData("employees")
      if (result.success && result.data) {
        this.employees = result.data
      } else {
        // Criar gerente padrão
        this.employees = [
          {
            id: "manager-001",
            name: "Gerente",
            pin: "1234",
            role: "gerente",
            active: true,
            createdAt: Date.now(),
          },
        ]
        await this.saveEmployees()
      }
    } catch (error) {
      console.error("Erro ao carregar funcionários:", error)
    }
  }

  async saveEmployees() {
    try {
      await window.webStorage.saveData("employees", this.employees)
    } catch (error) {
      console.error("Erro ao salvar funcionários:", error)
    }
  }

  setupOnlineStatus() {
    const updateOnlineStatus = () => {
      const statusEl = document.getElementById("online-status")
      if (statusEl) {
        statusEl.textContent = navigator.onLine ? "🟢 Online" : "🔴 Offline"
      }
    }

    window.addEventListener("online", updateOnlineStatus)
    window.addEventListener("offline", updateOnlineStatus)
    updateOnlineStatus()
  }

  initializeUI() {
    const mainContent = document.getElementById("main-content")

    if (!this.currentEmployee) {
      this.renderLoginScreen(mainContent)
    } else {
      this.renderMainApp(mainContent)
    }
  }

  renderLoginScreen(container) {
    container.innerHTML = `
      <div class="header">
        <div class="header-content">
          <div class="header-left">
            <div class="fuel-icon">⛽</div>
            <div>
              <h1>Posto de Gasolina</h1>
              <div class="subtitle">Sistema de Fechamento de Caixa Online</div>
            </div>
          </div>
          <div class="header-right">
            <button class="btn" onclick="app.showStorageInfo()">💾 Armazenamento</button>
            <button class="btn" onclick="app.showSystemInfo()">ℹ️ Info</button>
          </div>
        </div>
      </div>
      
      <div class="container">
        <div class="card" style="max-width: 400px; margin: 2rem auto;">
          <div class="card-header">
            <h2 class="card-title">
              <span>🔐</span>
              Login do Sistema
            </h2>
            <p class="card-description">Faça login para acessar o sistema</p>
          </div>
          
          <form id="loginForm" onsubmit="app.handleLogin(event)">
            <div class="form-group">
              <label class="form-label">Funcionário</label>
              <select class="form-select" id="employeeSelect" required>
                <option value="">Selecione o funcionário</option>
                ${this.employees
                  .filter((emp) => emp.active)
                  .map((emp) => `<option value="${emp.id}">${emp.name} (${emp.role})</option>`)
                  .join("")}
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label">PIN</label>
              <input type="password" class="form-input" id="pinInput" maxlength="6" required>
            </div>
            
            <button type="submit" class="btn btn-primary btn-lg" style="width: 100%;">
              Entrar
            </button>
          </form>
          
          <div style="margin-top: 1rem; text-align: center;">
            <button class="btn" onclick="app.showRegisterForm()">
              Cadastrar Funcionário
            </button>
          </div>
        </div>

        <div class="card" style="max-width: 600px; margin: 2rem auto;">
          <div class="card-header">
            <h2 class="card-title">
              <span>🌐</span>
              Sistema Web
            </h2>
            <p class="card-description">Características da versão online</p>
          </div>
          
          <div class="grid grid-2">
            <div>
              <h4>✅ Vantagens</h4>
              <ul style="margin-left: 1.5rem; color: var(--text-secondary);">
                <li>Acesso de qualquer lugar</li>
                <li>Não precisa instalar</li>
                <li>Sempre atualizado</li>
                <li>Funciona offline</li>
              </ul>
            </div>
            <div>
              <h4>📱 Recursos</h4>
              <ul style="margin-left: 1.5rem; color: var(--text-secondary);">
                <li>Dados salvos no navegador</li>
                <li>Backup/Restauração</li>
                <li>Responsivo (mobile)</li>
                <li>PWA (instalar como app)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    `
  }

  renderMainApp(container) {
    container.innerHTML = `
      <div class="header">
        <div class="header-content">
          <div class="header-left">
            <div class="fuel-icon">⛽</div>
            <div>
              <h1>Posto de Gasolina</h1>
              <div class="subtitle">
                ${this.currentEmployee.name} - ${this.currentEmployee.role}
              </div>
            </div>
          </div>
          <div class="header-right">
            <button class="btn" onclick="app.showStorageInfo()">💾 Dados</button>
            ${
              this.currentEmployee.role === "gerente"
                ? '<button class="btn" onclick="app.showEmployeeManagement()">👥 Funcionários</button>'
                : ""
            }
            ${
              this.currentEmployee.role === "gerente"
                ? '<button class="btn" onclick="app.showBackupManagement()">📦 Backup</button>'
                : ""
            }
            <button class="btn" onclick="app.showHistory()">📊 Histórico</button>
            <button class="btn" onclick="app.logout()">🚪 Sair</button>
          </div>
        </div>
      </div>
      
      <div class="container">
        ${this.renderDateNavigation()}
        ${this.renderDataEntry()}
        ${this.renderCardSection()}
        ${this.renderDailySummary()}
        ${this.renderMonthlySummary()}
      </div>
    `

    this.loadDayData()
  }

  renderDateNavigation() {
    const today = new Date()
    const isToday = this.formatDate(this.selectedDate) === this.formatDate(today)

    return `
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 1rem;">
          <button class="btn" onclick="app.navigateDate(-1)">← Anterior</button>
          <div class="text-center">
            <h3>${this.formatDateDisplay(this.selectedDate)}</h3>
            ${isToday ? '<span class="badge badge-info">Hoje</span>' : ""}
          </div>
          <button class="btn" onclick="app.navigateDate(1)">Próximo →</button>
        </div>
        
        <div class="form-group">
          <label class="form-label">Turno:</label>
          <select class="form-select" id="shiftSelect" onchange="app.changeShift(this.value)">
            <option value="manha" ${this.selectedShift === "manha" ? "selected" : ""}>Manhã (06:00-14:00)</option>
            <option value="intermediario1" ${this.selectedShift === "intermediario1" ? "selected" : ""}>Intermediário 1 (08:00-16:00)</option>
            <option value="intermediario2" ${this.selectedShift === "intermediario2" ? "selected" : ""}>Intermediário 2 (11:00-19:00)</option>
            <option value="tarde" ${this.selectedShift === "tarde" ? "selected" : ""}>Tarde (14:00-22:00)</option>
            <option value="noite" ${this.selectedShift === "noite" ? "selected" : ""}>Noite (22:00-06:00)</option>
          </select>
        </div>
      </div>
    `
  }

  renderDataEntry() {
    return `
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">
            <span>💰</span>
            Dados do Fechamento
          </h2>
          <p class="card-description">${this.currentEmployee.name} - ${this.getShiftName(this.selectedShift)}</p>
        </div>
        
        <div class="grid grid-2">
          <div class="form-group">
            <label class="form-label">💵 Dinheiro (R$)</label>
            <input type="number" step="0.01" class="form-input" id="cashDeposits" 
                   value="${this.formData.cashDeposits || ""}" 
                   onchange="app.updateFormData('cashDeposits', this.value)"
                   placeholder="0,00">
          </div>
          
          <div class="form-group">
            <label class="form-label">📱 PIX (R$)</label>
            <input type="number" step="0.01" class="form-input" id="pix" 
                   value="${this.formData.pix || ""}" 
                   onchange="app.updateFormData('pix', this.value)"
                   placeholder="0,00">
          </div>
          
          <div class="form-group">
            <label class="form-label">🎫 Vouchers (R$)</label>
            <input type="number" step="0.01" class="form-input" id="vouchers" 
                   value="${this.formData.vouchers || ""}" 
                   onchange="app.updateFormData('vouchers', this.value)"
                   placeholder="0,00">
          </div>
          
          <div class="form-group">
            <label class="form-label">📦 Produtos (R$)</label>
            <input type="number" step="0.01" class="form-input" id="products" 
                   value="${this.formData.products || ""}" 
                   onchange="app.updateFormData('products', this.value)"
                   placeholder="0,00">
          </div>
          
          <div class="form-group" style="grid-column: span 2;">
            <label class="form-label">🖥️ Sistema (R$)</label>
            <input type="number" step="0.01" class="form-input" id="system" 
                   value="${this.formData.system || ""}" 
                   onchange="app.updateFormData('system', this.value)"
                   placeholder="0,00">
          </div>
        </div>
      </div>
    `
  }

  renderCardSection() {
    const cards = ["master", "visa", "elo", "amex", "others"]
    const cardNames = {
      master: "MASTER",
      visa: "VISA",
      elo: "ELO",
      amex: "AMEX",
      others: "OUTRAS",
    }

    return `
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">
            <span>💳</span>
            Cartões por Bandeira
          </h2>
        </div>
        
        <div class="grid grid-2">
          ${cards
            .map(
              (card) => `
              <div style="border: 1px dashed var(--border); border-radius: 8px; padding: 1rem;">
                <h4 style="margin-bottom: 1rem; color: var(--text-primary);">${cardNames[card]}</h4>
                <div class="grid grid-2" style="gap: 0.5rem;">
                  <div class="form-group" style="margin-bottom: 0.5rem;">
                    <label class="form-label" style="font-size: 0.75rem;">Débito</label>
                    <input type="number" step="0.01" class="form-input" 
                           value="${this.formData.cardAmounts[card].debit || ""}"
                           onchange="app.updateCardAmount('${card}', 'debit', this.value)"
                           placeholder="0,00">
                  </div>
                  <div class="form-group" style="margin-bottom: 0.5rem;">
                    <label class="form-label" style="font-size: 0.75rem;">Crédito</label>
                    <input type="number" step="0.01" class="form-input" 
                           value="${this.formData.cardAmounts[card].credit || ""}"
                           onchange="app.updateCardAmount('${card}', 'credit', this.value)"
                           placeholder="0,00">
                  </div>
                </div>
                <div class="text-center" style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.5rem;">
                  Total: ${this.formatCurrency(this.formData.cardAmounts[card].debit + this.formData.cardAmounts[card].credit)}
                </div>
              </div>
            `,
            )
            .join("")}
        </div>
      </div>
    `
  }

  renderDailySummary() {
    const balance = this.calculateBalance()
    const cardsTotal = this.calculateCardsTotal()

    return `
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">
            <span>📊</span>
            Fechamento Diário
          </h2>
          <p class="card-description">${this.currentEmployee.name} - ${this.getShiftName(this.selectedShift)}</p>
        </div>
        
        <div class="grid grid-3">
          <div style="display: flex; justify-content: space-between;">
            <span>Dinheiro:</span>
            <span class="font-bold">${this.formatCurrency(this.formData.cashDeposits)}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>Cartões:</span>
            <span class="font-bold">${this.formatCurrency(cardsTotal)}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>PIX:</span>
            <span class="font-bold">${this.formatCurrency(this.formData.pix)}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>Vouchers:</span>
            <span class="font-bold">${this.formatCurrency(this.formData.vouchers)}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>Sistema:</span>
            <span class="font-bold text-red">-${this.formatCurrency(this.formData.system)}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>Produtos:</span>
            <span class="font-bold text-red">-${this.formatCurrency(this.formData.products)}</span>
          </div>
        </div>
        
        <div class="separator"></div>
        
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 1.25rem;">
          <span class="font-bold">Saldo Final:</span>
          <span class="font-bold ${balance >= 0 ? "text-green" : "text-red"}">${this.formatCurrency(balance)}</span>
        </div>
        
        <div class="text-center" style="margin-top: 1rem;">
          <span class="badge ${balance >= 0 ? "badge-success" : "badge-danger"}">
            ${balance >= 0 ? "Caixa Positivo" : "Caixa Negativo"}
          </span>
        </div>
        
        <div style="display: flex; gap: 1rem; margin-top: 2rem; flex-wrap: wrap;">
          <button class="btn btn-primary" onclick="app.saveDayData()" style="flex: 1; min-width: 200px;">
            💾 Salvar Fechamento
          </button>
          <button class="btn" onclick="app.clearForm()">
            🗑️ Limpar
          </button>
          <button class="btn" onclick="app.goToToday()">
            📅 Hoje
          </button>
          <button class="btn" onclick="app.printSummary()">
            🖨️ Imprimir
          </button>
        </div>
      </div>
    `
  }

  renderMonthlySummary() {
    return `
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">
            <span>📈</span>
            Fechamento Mensal
          </h2>
          <p class="card-description">${this.formatMonthYear(this.selectedDate)} - ${this.currentEmployee.name}</p>
        </div>
        
        <div class="text-center" style="padding: 2rem; color: var(--text-secondary);">
          <p>📊 Resumo mensal será calculado com base nos fechamentos salvos</p>
          <button class="btn btn-primary" onclick="app.calculateMonthlyReport()" style="margin-top: 1rem;">
            Calcular Relatório Mensal
          </button>
        </div>
      </div>
    `
  }

  // Event Handlers
  async handleLogin(event) {
    event.preventDefault()

    const employeeId = document.getElementById("employeeSelect").value
    const pin = document.getElementById("pinInput").value

    const employee = this.employees.find((emp) => emp.id === employeeId && emp.pin === pin && emp.active)

    if (employee) {
      this.currentEmployee = employee
      await this.loadSavedDays()
      this.initializeUI()
      this.showNotification(`Bem-vindo, ${employee.name}!`, "success")
    } else {
      this.showNotification("PIN incorreto ou funcionário inativo!", "error")
    }
  }

  logout() {
    this.currentEmployee = null
    this.clearForm()
    this.initializeUI()
    this.showNotification("Logout realizado com sucesso", "info")
  }

  navigateDate(direction) {
    const newDate = new Date(this.selectedDate)
    newDate.setDate(newDate.getDate() + direction)
    this.selectedDate = newDate
    this.loadDayData()
    this.initializeUI()
  }

  goToToday() {
    this.selectedDate = new Date()
    this.loadDayData()
    this.initializeUI()
    this.showNotification("Navegado para hoje", "info")
  }

  changeShift(shift) {
    this.selectedShift = shift
    this.loadDayData()
    this.initializeUI()
  }

  updateFormData(field, value) {
    this.formData[field] = Number.parseFloat(value) || 0
    this.updateSummary()
  }

  updateCardAmount(card, type, value) {
    this.formData.cardAmounts[card][type] = Number.parseFloat(value) || 0
    this.updateSummary()
  }

  updateSummary() {
    // Re-render apenas o resumo diário
    const summaryCard = document.querySelector(".card:nth-last-child(2)")
    if (summaryCard) {
      summaryCard.outerHTML = this.renderDailySummary()
    }
  }

  clearForm() {
    this.formData = {
      cashDeposits: 0,
      pix: 0,
      vouchers: 0,
      products: 0,
      system: 0,
      cardAmounts: {
        master: { debit: 0, credit: 0 },
        visa: { debit: 0, credit: 0 },
        elo: { debit: 0, credit: 0 },
        amex: { debit: 0, credit: 0 },
        others: { debit: 0, credit: 0 },
      },
    }
    this.initializeUI()
    this.showNotification("Formulário limpo", "info")
  }

  async saveDayData() {
    if (!this.currentEmployee) return

    try {
      const dateKey = `${this.formatDate(this.selectedDate)}_${this.selectedShift}`
      const dayData = {
        id: `${this.currentEmployee.id}_${dateKey}`,
        date: this.formatDate(this.selectedDate),
        employeeId: this.currentEmployee.id,
        employeeName: this.currentEmployee.name,
        shift: this.selectedShift,
        ...this.formData,
        balance: this.calculateBalance(),
        timestamp: Date.now(),
      }

      // Carregar dados existentes do funcionário
      const storageKey = `closings_${this.currentEmployee.id}`
      const result = await window.webStorage.loadData(storageKey)
      const allData = result.success && result.data ? result.data : {}

      // Adicionar novo fechamento
      allData[dateKey] = dayData

      // Salvar dados atualizados
      await window.webStorage.saveData(storageKey, allData)

      this.showNotification("Fechamento salvo com sucesso!", "success")
      await this.loadSavedDays()
    } catch (error) {
      console.error("Erro ao salvar:", error)
      this.showNotification("Erro ao salvar os dados!", "error")
    }
  }

  async loadSavedDays() {
    if (!this.currentEmployee) return

    try {
      const storageKey = `closings_${this.currentEmployee.id}`
      const result = await window.webStorage.loadData(storageKey)

      if (result.success && result.data) {
        this.savedDays = Object.values(result.data).sort((a, b) => b.timestamp - a.timestamp)
      } else {
        this.savedDays = []
      }
    } catch (error) {
      console.error("Erro ao carregar dias salvos:", error)
      this.savedDays = []
    }
  }

  async loadDayData() {
    if (!this.currentEmployee) return

    try {
      const storageKey = `closings_${this.currentEmployee.id}`
      const result = await window.webStorage.loadData(storageKey)

      if (result.success && result.data) {
        const dateKey = `${this.formatDate(this.selectedDate)}_${this.selectedShift}`
        const dayData = result.data[dateKey]

        if (dayData) {
          this.formData = {
            cashDeposits: dayData.cashDeposits || 0,
            pix: dayData.pix || 0,
            vouchers: dayData.vouchers || 0,
            products: dayData.products || 0,
            system: dayData.system || 0,
            cardAmounts: dayData.cardAmounts || {
              master: { debit: 0, credit: 0 },
              visa: { debit: 0, credit: 0 },
              elo: { debit: 0, credit: 0 },
              amex: { debit: 0, credit: 0 },
              others: { debit: 0, credit: 0 },
            },
          }
        } else {
          this.clearForm()
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados do dia:", error)
    }
  }

  // Utility Methods
  calculateBalance() {
    const cardsTotal = this.calculateCardsTotal()
    return (
      this.formData.cashDeposits +
      cardsTotal +
      this.formData.pix +
      this.formData.vouchers -
      this.formData.system -
      this.formData.products
    )
  }

  calculateCardsTotal() {
    let total = 0
    Object.values(this.formData.cardAmounts).forEach((card) => {
      total += (card.debit || 0) + (card.credit || 0)
    })
    return total
  }

  formatCurrency(value) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0)
  }

  formatDate(date) {
    return date.toISOString().split("T")[0]
  }

  formatDateDisplay(date) {
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  formatMonthYear(date) {
    return date.toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    })
  }

  getShiftName(shift) {
    const shifts = {
      manha: "Manhã (06:00-14:00)",
      intermediario1: "Intermediário 1 (08:00-16:00)",
      intermediario2: "Intermediário 2 (11:00-19:00)",
      tarde: "Tarde (14:00-22:00)",
      noite: "Noite (22:00-06:00)",
    }
    return shifts[shift] || shift
  }

  updateStatus(message) {
    const statusEl = document.getElementById("status-text")
    if (statusEl) {
      statusEl.textContent = message
    }
  }

  showNotification(message, type = "info") {
    const notification = document.createElement("div")
    notification.className = `notification notification-${type}`
    notification.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span>${message}</span>
        <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 1.2rem; cursor: pointer;">×</button>
      </div>
    `

    document.body.appendChild(notification)

    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove()
      }
    }, 5000)
  }

  // Feature Methods
  showStorageInfo() {
    const info = window.webStorage.getStorageInfo()
    this.showNotification(`Armazenamento: ${info.type} - ${info.sizeFormatted || "N/A"}`, "info")
  }

  showSystemInfo() {
    const info = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      online: navigator.onLine,
      storage: window.webStorage.getStorageInfo(),
    }

    console.log("Informações do sistema:", info)
    this.showNotification("Informações do sistema exibidas no console", "info")
  }

  showRegisterForm() {
    this.showNotification("Funcionalidade de cadastro será implementada", "warning")
  }

  showEmployeeManagement() {
    this.showNotification("Gerenciamento de funcionários será implementado", "warning")
  }

  showBackupManagement() {
    this.showNotification("Gerenciamento de backup será implementado", "warning")
  }

  showHistory() {
    this.showNotification("Histórico será implementado", "warning")
  }

  calculateMonthlyReport() {
    this.showNotification("Relatório mensal será implementado", "warning")
  }

  printSummary() {
    window.print()
  }
}

// Inicializar aplicação quando a página carregar
let app
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM carregado, iniciando aplicação web...")
  app = new PostoCaixaWebApp()
})

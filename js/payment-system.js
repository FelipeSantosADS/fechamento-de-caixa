// Sistema de Pagamento e Licenciamento
class PaymentSystem {
  constructor() {
    this.apiKey = "pk_test_sua_chave_stripe" // Substitua pela sua chave do Stripe
    this.plans = {
      free: {
        id: "free",
        name: "Gratuito",
        price: 0,
        period: "mensal",
        features: ["1 funcionário", "30 dias de histórico", "Suporte básico"],
        limits: {
          employees: 1,
          historyDays: 30,
          backups: 1,
        },
      },
      basic: {
        id: "basic",
        name: "Básico",
        price: 29.9,
        period: "mensal",
        features: ["5 funcionários", "90 dias de histórico", "Backup automático", "Suporte email"],
        limits: {
          employees: 5,
          historyDays: 90,
          backups: 10,
        },
      },
      premium: {
        id: "premium",
        name: "Premium",
        price: 59.9,
        period: "mensal",
        features: [
          "Funcionários ilimitados",
          "Histórico ilimitado",
          "Backup em nuvem",
          "Relatórios avançados",
          "Suporte prioritário",
        ],
        limits: {
          employees: -1, // ilimitado
          historyDays: -1,
          backups: -1,
        },
      },
      enterprise: {
        id: "enterprise",
        name: "Empresarial",
        price: 99.9,
        period: "mensal",
        features: ["Multi-lojas", "API personalizada", "Integração ERP", "Suporte 24/7", "Treinamento"],
        limits: {
          employees: -1,
          historyDays: -1,
          backups: -1,
          stores: -1,
        },
      },
    }

    this.currentPlan = "free"
    this.subscriptionStatus = "inactive"
    this.trialDays = 7
    this.init()
  }

  async init() {
    await this.loadSubscriptionStatus()
    this.setupPaymentButtons()
    this.checkTrialStatus()
  }

  // Carregar status da assinatura
  async loadSubscriptionStatus() {
    try {
      const result = await window.webStorage.loadData("subscription")
      if (result.success && result.data) {
        this.currentPlan = result.data.plan || "free"
        this.subscriptionStatus = result.data.status || "inactive"
        this.subscriptionEnd = result.data.endDate
        this.trialStart = result.data.trialStart
      }
    } catch (error) {
      console.error("Erro ao carregar assinatura:", error)
    }
  }

  // Salvar status da assinatura
  async saveSubscriptionStatus() {
    try {
      const data = {
        plan: this.currentPlan,
        status: this.subscriptionStatus,
        endDate: this.subscriptionEnd,
        trialStart: this.trialStart,
        lastUpdate: Date.now(),
      }
      await window.webStorage.saveData("subscription", data)
    } catch (error) {
      console.error("Erro ao salvar assinatura:", error)
    }
  }

  // Verificar se está no período de teste
  isInTrial() {
    if (!this.trialStart) return false
    const trialEnd = new Date(this.trialStart)
    trialEnd.setDate(trialEnd.getDate() + this.trialDays)
    return new Date() < trialEnd
  }

  // Verificar se a assinatura está ativa
  isSubscriptionActive() {
    if (this.currentPlan === "free") return true
    if (this.isInTrial()) return true
    if (this.subscriptionStatus === "active" && this.subscriptionEnd) {
      return new Date() < new Date(this.subscriptionEnd)
    }
    return false
  }

  // Iniciar período de teste
  async startTrial() {
    this.trialStart = new Date().toISOString()
    this.currentPlan = "premium" // Teste premium
    this.subscriptionStatus = "trial"
    await this.saveSubscriptionStatus()

    if (window.app) {
      window.app.showNotification(`Período de teste iniciado! ${this.trialDays} dias grátis`, "success")
    }
  }

  // Verificar limites do plano atual
  checkLimits(feature, currentUsage) {
    const plan = this.plans[this.currentPlan]
    if (!plan || !plan.limits[feature]) return true

    const limit = plan.limits[feature]
    if (limit === -1) return true // ilimitado

    return currentUsage < limit
  }

  // Mostrar modal de upgrade
  showUpgradeModal(reason = "") {
    const modal = document.createElement("div")
    modal.className = "modal"
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 800px;">
        <div class="modal-header">
          <h2 class="modal-title">🚀 Upgrade Necessário</h2>
          <button onclick="this.closest('.modal').remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">×</button>
        </div>
        
        ${reason ? `<div class="alert alert-warning">${reason}</div>` : ""}
        
        <div class="pricing-grid">
          ${Object.values(this.plans)
            .map((plan) => this.renderPlanCard(plan))
            .join("")}
        </div>
        
        <div class="modal-actions">
          <button class="btn" onclick="this.closest('.modal').remove()">Cancelar</button>
        </div>
      </div>
    `

    document.body.appendChild(modal)
  }

  // Renderizar card do plano
  renderPlanCard(plan) {
    const isCurrentPlan = plan.id === this.currentPlan
    const isFree = plan.price === 0

    return `
      <div class="plan-card ${isCurrentPlan ? "current-plan" : ""}">
        <div class="plan-header">
          <h3>${plan.name}</h3>
          <div class="plan-price">
            ${isFree ? "Gratuito" : `R$ ${plan.price.toFixed(2)}`}
            ${!isFree ? `<span class="plan-period">/${plan.period}</span>` : ""}
          </div>
        </div>
        
        <div class="plan-features">
          ${plan.features.map((feature) => `<div class="feature">✓ ${feature}</div>`).join("")}
        </div>
        
        <div class="plan-actions">
          ${
            isCurrentPlan
              ? '<button class="btn btn-secondary" disabled>Plano Atual</button>'
              : isFree
                ? '<button class="btn" onclick="paymentSystem.downgradeToPlan(\'free\')">Usar Gratuito</button>'
                : `<button class="btn btn-primary" onclick="paymentSystem.upgradeToPlan('${plan.id}')">
                ${this.currentPlan === "free" ? "Assinar" : "Fazer Upgrade"}
              </button>`
          }
        </div>
      </div>
    `
  }

  // Fazer upgrade para um plano
  async upgradeToPlan(planId) {
    const plan = this.plans[planId]
    if (!plan) return

    if (plan.price === 0) {
      // Plano gratuito
      this.currentPlan = "free"
      this.subscriptionStatus = "active"
      await this.saveSubscriptionStatus()
      window.location.reload()
      return
    }

    // Mostrar opções de pagamento
    this.showPaymentModal(plan)
  }

  // Mostrar modal de pagamento
  showPaymentModal(plan) {
    const modal = document.createElement("div")
    modal.className = "modal"
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title">💳 Pagamento - ${plan.name}</h2>
          <button onclick="this.closest('.modal').remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">×</button>
        </div>
        
        <div class="payment-summary">
          <h3>Resumo do Pedido</h3>
          <div class="summary-item">
            <span>Plano ${plan.name}</span>
            <span>R$ ${plan.price.toFixed(2)}/${plan.period}</span>
          </div>
          <div class="summary-total">
            <span>Total</span>
            <span>R$ ${plan.price.toFixed(2)}</span>
          </div>
        </div>
        
        <div class="payment-methods">
          <h3>Forma de Pagamento</h3>
          
          <div class="payment-tabs">
            <button class="payment-tab active" onclick="paymentSystem.showPaymentMethod('pix')">PIX</button>
            <button class="payment-tab" onclick="paymentSystem.showPaymentMethod('card')">Cartão</button>
            <button class="payment-tab" onclick="paymentSystem.showPaymentMethod('boleto')">Boleto</button>
          </div>
          
          <div id="payment-method-content">
            ${this.renderPixPayment(plan)}
          </div>
        </div>
        
        <div class="modal-actions">
          <button class="btn" onclick="this.closest('.modal').remove()">Cancelar</button>
        </div>
      </div>
    `

    document.body.appendChild(modal)
  }

  // Renderizar pagamento PIX
  renderPixPayment(plan) {
    const pixCode = this.generatePixCode(plan)

    return `
      <div class="payment-method pix-payment">
        <div class="pix-info">
          <h4>🔥 PIX - Ativação Imediata</h4>
          <p>Escaneie o QR Code ou copie o código PIX</p>
        </div>
        
        <div class="pix-qr">
          <div class="qr-placeholder">
            <div style="font-size: 4rem;">📱</div>
            <p>QR Code PIX</p>
            <small>Valor: R$ ${plan.price.toFixed(2)}</small>
          </div>
        </div>
        
        <div class="pix-code">
          <label>Código PIX (Copia e Cola):</label>
          <div class="code-input">
            <input type="text" value="${pixCode}" readonly id="pixCode">
            <button class="btn btn-sm" onclick="paymentSystem.copyPixCode()">Copiar</button>
          </div>
        </div>
        
        <div class="payment-instructions">
          <h5>Como pagar:</h5>
          <ol>
            <li>Abra o app do seu banco</li>
            <li>Escolha PIX → Pagar com QR Code ou Copia e Cola</li>
            <li>Escaneie o código ou cole o código PIX</li>
            <li>Confirme o pagamento</li>
            <li>Sua assinatura será ativada automaticamente</li>
          </ol>
        </div>
        
        <button class="btn btn-primary" onclick="paymentSystem.simulatePixPayment('${plan.id}')">
          ✅ Simular Pagamento (DEMO)
        </button>
      </div>
    `
  }

  // Gerar código PIX (simulado)
  generatePixCode(plan) {
    const timestamp = Date.now()
    const planCode = plan.id.toUpperCase()
    return `00020126580014BR.GOV.BCB.PIX0136${timestamp}520400005303986540${plan.price.toFixed(2)}5802BR5925POSTO GASOLINA SISTEMA6009SAO PAULO${planCode}6304`
  }

  // Copiar código PIX
  copyPixCode() {
    const pixInput = document.getElementById("pixCode")
    pixInput.select()
    document.execCommand("copy")

    if (window.app) {
      window.app.showNotification("Código PIX copiado!", "success")
    }
  }

  // Simular pagamento PIX (para demonstração)
  async simulatePixPayment(planId) {
    if (window.app) {
      window.app.showNotification("Processando pagamento...", "info")
    }

    // Simular delay do pagamento
    setTimeout(async () => {
      await this.activateSubscription(planId)

      // Fechar modal
      const modal = document.querySelector(".modal")
      if (modal) modal.remove()

      if (window.app) {
        window.app.showNotification("🎉 Pagamento confirmado! Assinatura ativada!", "success")
      }

      // Recarregar página para aplicar novo plano
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    }, 3000)
  }

  // Ativar assinatura
  async activateSubscription(planId) {
    this.currentPlan = planId
    this.subscriptionStatus = "active"

    // Definir data de vencimento (30 dias)
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 30)
    this.subscriptionEnd = endDate.toISOString()

    await this.saveSubscriptionStatus()
  }

  // Mostrar método de pagamento
  showPaymentMethod(method) {
    // Atualizar tabs
    document.querySelectorAll(".payment-tab").forEach((tab) => {
      tab.classList.remove("active")
    })
    event.target.classList.add("active")

    // Atualizar conteúdo (implementar outros métodos)
    const content = document.getElementById("payment-method-content")
    if (method === "pix") {
      // PIX já está implementado
    } else {
      content.innerHTML = `
        <div class="payment-method">
          <p>🚧 ${method.toUpperCase()} em desenvolvimento</p>
          <p>Use PIX para ativação imediata</p>
        </div>
      `
    }
  }

  // Configurar botões de pagamento
  setupPaymentButtons() {
    // Adicionar botão de upgrade na interface
    if (this.currentPlan === "free" && !this.isInTrial()) {
      this.addUpgradeButton()
    }
  }

  // Adicionar botão de upgrade
  addUpgradeButton() {
    const header = document.querySelector(".header-right")
    if (header && !document.getElementById("upgrade-btn")) {
      const upgradeBtn = document.createElement("button")
      upgradeBtn.id = "upgrade-btn"
      upgradeBtn.className = "btn btn-primary"
      upgradeBtn.innerHTML = "⭐ Upgrade"
      upgradeBtn.onclick = () => this.showUpgradeModal()
      header.appendChild(upgradeBtn)
    }
  }

  // Verificar status do teste
  checkTrialStatus() {
    if (this.isInTrial()) {
      const trialEnd = new Date(this.trialStart)
      trialEnd.setDate(trialEnd.getDate() + this.trialDays)
      const daysLeft = Math.ceil((trialEnd - new Date()) / (1000 * 60 * 60 * 24))

      if (window.app) {
        window.app.showNotification(`⏰ Teste Premium: ${daysLeft} dias restantes`, "warning")
      }
    }
  }

  // Verificar se pode usar funcionalidade
  canUseFeature(feature, currentUsage = 0) {
    if (!this.isSubscriptionActive()) {
      this.showUpgradeModal("Assinatura expirada. Renove para continuar usando.")
      return false
    }

    if (!this.checkLimits(feature, currentUsage)) {
      const plan = this.plans[this.currentPlan]
      const limit = plan.limits[feature]
      this.showUpgradeModal(`Limite do plano ${plan.name} atingido: ${limit} ${feature}`)
      return false
    }

    return true
  }

  // Obter informações da assinatura atual
  getSubscriptionInfo() {
    const plan = this.plans[this.currentPlan]
    return {
      plan: plan,
      status: this.subscriptionStatus,
      isActive: this.isSubscriptionActive(),
      isInTrial: this.isInTrial(),
      endDate: this.subscriptionEnd,
      trialDaysLeft: this.isInTrial()
        ? Math.ceil(
            (new Date(this.trialStart).getTime() + this.trialDays * 24 * 60 * 60 * 1000 - Date.now()) /
              (1000 * 60 * 60 * 24),
          )
        : 0,
    }
  }
}

// CSS para o sistema de pagamento
const paymentCSS = `
<style>
.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
}

.plan-card {
  border: 2px solid var(--border);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
}

.plan-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.plan-card.current-plan {
  border-color: var(--success-color);
  background: #f0fdf4;
}

.plan-header h3 {
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.plan-price {
  font-size: 2rem;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.plan-period {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.plan-features {
  text-align: left;
  margin: 1.5rem 0;
}

.feature {
  padding: 0.25rem 0;
  color: var(--text-secondary);
}

.plan-actions {
  margin-top: 1.5rem;
}

.payment-summary {
  background: var(--background);
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  font-size: 1.1rem;
  border-top: 1px solid var(--border);
  padding-top: 0.5rem;
  margin-top: 0.5rem;
}

.payment-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.payment-tab {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border);
  background: var(--surface);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.payment-tab.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.pix-payment {
  text-align: center;
}

.pix-qr {
  margin: 1rem 0;
}

.qr-placeholder {
  border: 2px dashed var(--border);
  padding: 2rem;
  border-radius: 8px;
  background: var(--background);
}

.code-input {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.code-input input {
  flex: 1;
  font-family: monospace;
  font-size: 0.875rem;
}

.payment-instructions {
  text-align: left;
  background: var(--background);
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
}

.payment-instructions ol {
  margin-left: 1rem;
}

.payment-instructions li {
  margin-bottom: 0.25rem;
}

.alert {
  padding: 1rem;
  border-radius: 6px;
  margin: 1rem 0;
}

.alert-warning {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fbbf24;
}

@media (max-width: 768px) {
  .pricing-grid {
    grid-template-columns: 1fr;
  }
  
  .code-input {
    flex-direction: column;
  }
}
</style>
`

// Adicionar CSS ao documento
document.head.insertAdjacentHTML("beforeend", paymentCSS)

// Instância global
window.paymentSystem = new PaymentSystem()

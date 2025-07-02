// Progressive Web App functionality
class PWAManager {
  constructor() {
    this.deferredPrompt = null
    this.init()
  }

  init() {
    // Register service worker
    this.registerServiceWorker()

    // Setup install prompt
    this.setupInstallPrompt()

    // Handle app installed
    this.handleAppInstalled()
  }

  async registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js")
        console.log("Service Worker registrado:", registration)
      } catch (error) {
        console.log("Erro ao registrar Service Worker:", error)
      }
    }
  }

  setupInstallPrompt() {
    window.addEventListener("beforeinstallprompt", (e) => {
      console.log("beforeinstallprompt event fired")
      e.preventDefault()
      this.deferredPrompt = e
      this.showInstallBanner()
    })

    // Handle install button click
    const installBtn = document.getElementById("install-btn")
    if (installBtn) {
      installBtn.addEventListener("click", () => {
        this.installApp()
      })
    }

    // Handle dismiss button click
    const dismissBtn = document.getElementById("dismiss-btn")
    if (dismissBtn) {
      dismissBtn.addEventListener("click", () => {
        this.hideInstallBanner()
      })
    }
  }

  showInstallBanner() {
    const banner = document.getElementById("install-banner")
    if (banner) {
      banner.style.display = "block"
    }
  }

  hideInstallBanner() {
    const banner = document.getElementById("install-banner")
    if (banner) {
      banner.style.display = "none"
    }
  }

  async installApp() {
    if (!this.deferredPrompt) return

    this.deferredPrompt.prompt()
    const { outcome } = await this.deferredPrompt.userChoice

    console.log(`User response to install prompt: ${outcome}`)

    if (outcome === "accepted") {
      console.log("User accepted the install prompt")
    } else {
      console.log("User dismissed the install prompt")
    }

    this.deferredPrompt = null
    this.hideInstallBanner()
  }

  handleAppInstalled() {
    window.addEventListener("appinstalled", (e) => {
      console.log("PWA foi instalado")
      this.hideInstallBanner()

      // Show notification
      if (window.app) {
        window.app.showNotification("App instalado com sucesso!", "success")
      }
    })
  }
}

// Initialize PWA manager
document.addEventListener("DOMContentLoaded", () => {
  new PWAManager()
})

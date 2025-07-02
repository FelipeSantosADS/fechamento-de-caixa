"use client"

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

import { useState, useEffect } from "react"
import {
  DollarSign,
  CreditCard,
  Smartphone,
  Receipt,
  Package,
  Calculator,
  Save,
  History,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  User,
  Plus,
  Minus,
  LogOut,
  Users,
  Eye,
  EyeOff,
  Fuel,
  Calendar,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useTheme } from "next-themes"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CardAmounts {
  master: { debit: number; credit: number }
  visa: { debit: number; credit: number }
  elo: { debit: number; credit: number }
  amex: { debit: number; credit: number }
  others: { debit: number; credit: number }
}

interface DailyClosing {
  id: string
  date: string
  employeeId: string
  employeeName: string
  shift: string
  cashDeposits: number
  pix: number
  vouchers: number
  products: number
  system: number
  cardAmounts: CardAmounts
  balance: number
  timestamp: number
}

interface Employee {
  id: string
  name: string
  pin: string
  role: "funcionario" | "gerente"
  active: boolean
  createdAt: number
}

interface BackupData {
  employees: Employee[]
  closings: { [employeeId: string]: any }
  timestamp: number
  date: string
}

export default function GasStationCashSystem() {
  const { theme, setTheme } = useTheme()
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [showEmployeeManagement, setShowEmployeeManagement] = useState(false)

  // Login/Register states
  const [loginPin, setLoginPin] = useState("")
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("")
  const [newEmployeeName, setNewEmployeeName] = useState("")
  const [newEmployeePin, setNewEmployeePin] = useState("")
  const [newEmployeeRole, setNewEmployeeRole] = useState<"funcionario" | "gerente">("funcionario")
  const [showPin, setShowPin] = useState(false)

  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [savedDays, setSavedDays] = useState<DailyClosing[]>([])
  const [isViewingHistory, setIsViewingHistory] = useState(false)
  const [selectedShift, setSelectedShift] = useState("manha")

  // Payment amounts
  const [cashDeposits, setCashDeposits] = useState(0)
  const [pix, setPix] = useState(0)
  const [vouchers, setVouchers] = useState(0)
  const [products, setProducts] = useState(0)
  const [system, setSystem] = useState(0)

  const [cardAmounts, setCardAmounts] = useState<CardAmounts>({
    master: { debit: 0, credit: 0 },
    visa: { debit: 0, credit: 0 },
    elo: { debit: 0, credit: 0 },
    amex: { debit: 0, credit: 0 },
    others: { debit: 0, credit: 0 },
  })

  const [lastBackupDate, setLastBackupDate] = useState<string>("")

  // Adicionar estado para controlar o dialog de backup:
  const [showBackupDialog, setShowBackupDialog] = useState(false)

  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingClosing, setEditingClosing] = useState<DailyClosing | null>(null)
  const [allEmployeeClosings, setAllEmployeeClosings] = useState<DailyClosing[]>([])
  const [selectedEmployeeForEdit, setSelectedEmployeeForEdit] = useState("")

  // Load data on component mount
  useEffect(() => {
    loadEmployees()
    if (currentEmployee) {
      loadSavedDays()
      loadDayData(selectedDate)
    }
  }, [currentEmployee])

  useEffect(() => {
    if (currentEmployee) {
      loadDayData(selectedDate)
    }
  }, [selectedDate, currentEmployee])

  useEffect(() => {
    if (currentEmployee?.role === "gerente") {
      loadAllEmployeeClosings()
    }
  }, [currentEmployee, employees])

  // Backup automático diário
  useEffect(() => {
    const checkAndPerformBackup = () => {
      const now = new Date()
      const currentDate = now.toISOString().split("T")[0]
      const currentHour = now.getHours()
      const currentMinute = now.getMinutes()

      // Verificar se é 00:01 e se ainda não foi feito backup hoje
      if (currentHour === 0 && currentMinute === 1 && lastBackupDate !== currentDate) {
        performDailyBackup()
        setLastBackupDate(currentDate)
      }
    }

    // Verificar a cada minuto
    const interval = setInterval(checkAndPerformBackup, 60000)

    // Carregar última data de backup
    const savedBackupDate = localStorage.getItem("lastBackupDate")
    if (savedBackupDate) {
      setLastBackupDate(savedBackupDate)
    }

    return () => clearInterval(interval)
  }, [])

  const loadEmployees = () => {
    try {
      const saved = localStorage.getItem("gasStationEmployees")
      if (saved) {
        const employeeData = JSON.parse(saved)
        setEmployees(employeeData)
      } else {
        // Create default manager if no employees exist
        const defaultManager: Employee = {
          id: "manager-001",
          name: "Gerente",
          pin: "1234",
          role: "gerente",
          active: true,
          createdAt: Date.now(),
        }
        setEmployees([defaultManager])
        localStorage.setItem("gasStationEmployees", JSON.stringify([defaultManager]))
      }
    } catch (error) {
      console.error("Erro ao carregar funcionários:", error)
    }
  }

  const saveEmployees = (employeeList: Employee[]) => {
    try {
      localStorage.setItem("gasStationEmployees", JSON.stringify(employeeList))
      setEmployees(employeeList)
    } catch (error) {
      console.error("Erro ao salvar funcionários:", error)
    }
  }

  const handleLogin = () => {
    const employee = employees.find((emp) => emp.id === selectedEmployeeId && emp.pin === loginPin && emp.active)
    if (employee) {
      setCurrentEmployee(employee)
      setLoginPin("")
      setSelectedEmployeeId("")
    } else {
      alert("PIN incorreto ou funcionário inativo!")
    }
  }

  const handleRegisterEmployee = () => {
    if (!newEmployeeName.trim() || !newEmployeePin.trim()) {
      alert("Preencha todos os campos!")
      return
    }

    if (employees.some((emp) => emp.pin === newEmployeePin)) {
      alert("Este PIN já está em uso!")
      return
    }

    const newEmployee: Employee = {
      id: `emp-${Date.now()}`,
      name: newEmployeeName.trim(),
      pin: newEmployeePin.trim(),
      role: newEmployeeRole,
      active: true,
      createdAt: Date.now(),
    }

    const updatedEmployees = [...employees, newEmployee]
    saveEmployees(updatedEmployees)

    setNewEmployeeName("")
    setNewEmployeePin("")
    setNewEmployeeRole("funcionario")
    alert("Funcionário cadastrado com sucesso!")
  }

  const toggleEmployeeStatus = (employeeId: string) => {
    const updatedEmployees = employees.map((emp) => (emp.id === employeeId ? { ...emp, active: !emp.active } : emp))
    saveEmployees(updatedEmployees)
  }

  const deleteEmployee = (employeeId: string) => {
    if (confirm("Tem certeza que deseja excluir este funcionário?")) {
      const updatedEmployees = employees.filter((emp) => emp.id !== employeeId)
      saveEmployees(updatedEmployees)
    }
  }

  const getDateKey = (date: Date) => {
    return date.toISOString().split("T")[0]
  }

  const getStorageKey = (employeeId: string) => {
    return `gasStationClosings_${employeeId}`
  }

  const loadSavedDays = () => {
    if (!currentEmployee) return

    try {
      const saved = localStorage.getItem(getStorageKey(currentEmployee.id))
      if (saved) {
        const parsedData = JSON.parse(saved)
        const daysArray = Object.values(parsedData) as DailyClosing[]
        setSavedDays(daysArray.sort((a, b) => b.timestamp - a.timestamp))
      } else {
        setSavedDays([])
      }
    } catch (error) {
      console.error("Erro ao carregar dias salvos:", error)
    }
  }

  const loadDayData = (date: Date) => {
    if (!currentEmployee) return

    try {
      const saved = localStorage.getItem(getStorageKey(currentEmployee.id))
      if (saved) {
        const parsedData = JSON.parse(saved)
        const dateKey = `${getDateKey(date)}_${selectedShift}`
        const dayData = parsedData[dateKey]

        if (dayData) {
          setCashDeposits(dayData.cashDeposits)
          setPix(dayData.pix)
          setVouchers(dayData.vouchers)
          setProducts(dayData.products)
          setSystem(dayData.system)
          setCardAmounts(dayData.cardAmounts)
        } else {
          resetForm()
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados do dia:", error)
    }
  }

  const saveDayData = () => {
    if (!currentEmployee) return

    try {
      const dateKey = `${getDateKey(selectedDate)}_${selectedShift}`
      const dayData: DailyClosing = {
        id: `${currentEmployee.id}_${dateKey}`,
        date: getDateKey(selectedDate),
        employeeId: currentEmployee.id,
        employeeName: currentEmployee.name,
        shift: selectedShift,
        cashDeposits,
        pix,
        vouchers,
        products,
        system,
        cardAmounts,
        balance: calculateBalance(),
        timestamp: Date.now(),
      }

      const saved = localStorage.getItem(getStorageKey(currentEmployee.id))
      const allData = saved ? JSON.parse(saved) : {}
      allData[dateKey] = dayData

      localStorage.setItem(getStorageKey(currentEmployee.id), JSON.stringify(allData))
      loadSavedDays()

      alert("Fechamento salvo com sucesso!")
    } catch (error) {
      console.error("Erro ao salvar dados:", error)
      alert("Erro ao salvar os dados!")
    }
  }

  const deleteDayData = (dayData: DailyClosing) => {
    if (!currentEmployee) return

    try {
      const saved = localStorage.getItem(getStorageKey(currentEmployee.id))
      if (saved) {
        const allData = JSON.parse(saved)
        const dateKey = `${dayData.date}_${dayData.shift}`
        delete allData[dateKey]
        localStorage.setItem(getStorageKey(currentEmployee.id), JSON.stringify(allData))
        loadSavedDays()

        if (getDateKey(selectedDate) === dayData.date && selectedShift === dayData.shift) {
          resetForm()
        }
      }
    } catch (error) {
      console.error("Erro ao excluir dados:", error)
    }
  }

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate)
    if (direction === "prev") {
      newDate.setDate(newDate.getDate() - 1)
    } else {
      newDate.setDate(newDate.getDate() + 1)
    }
    setSelectedDate(newDate)
  }

  const goToToday = () => {
    setSelectedDate(new Date())
  }

  const calculateCardsTotal = () => {
    let total = 0
    Object.values(cardAmounts).forEach((card) => {
      total += card.debit + card.credit
    })
    return total
  }

  const calculateBalance = () => {
    const cardsTotal = calculateCardsTotal()
    return cashDeposits + cardsTotal + pix + vouchers - system - products
  }

  const updateCardAmount = (flag: keyof CardAmounts, type: "debit" | "credit", value: number) => {
    setCardAmounts((prev) => ({
      ...prev,
      [flag]: {
        ...prev[flag],
        [type]: value,
      },
    }))
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const resetForm = () => {
    setCashDeposits(0)
    setPix(0)
    setVouchers(0)
    setProducts(0)
    setSystem(0)
    setCardAmounts({
      master: { debit: 0, credit: 0 },
      visa: { debit: 0, credit: 0 },
      elo: { debit: 0, credit: 0 },
      amex: { debit: 0, credit: 0 },
      others: { debit: 0, credit: 0 },
    })
  }

  const handleLogout = () => {
    setCurrentEmployee(null)
    resetForm()
    setSavedDays([])
  }

  const balance = calculateBalance()
  const cardsTotal = calculateCardsTotal()
  const isToday = getDateKey(selectedDate) === getDateKey(currentDate)
  const hasDataForSelectedDate = savedDays.some(
    (day) => day.date === getDateKey(selectedDate) && day.shift === selectedShift,
  )

  const getMonthlyData = () => {
    const currentMonth = selectedDate.getMonth()
    const currentYear = selectedDate.getFullYear()

    const monthlyClosings = savedDays.filter((day) => {
      const dayDate = new Date(day.date)
      return dayDate.getMonth() === currentMonth && dayDate.getFullYear() === currentYear
    })

    const totalBalance = monthlyClosings.reduce((sum, day) => sum + day.balance, 0)
    const totalDays = monthlyClosings.length
    const averageDaily = totalDays > 0 ? totalBalance / totalDays : 0

    const positivesDays = monthlyClosings.filter((day) => day.balance >= 0).length
    const negativeDays = monthlyClosings.filter((day) => day.balance < 0).length

    return {
      monthlyClosings,
      totalBalance,
      totalDays,
      averageDaily,
      positivesDays,
      negativeDays,
    }
  }

  const performDailyBackup = () => {
    try {
      console.log("Iniciando backup automático diário...")

      // Coletar dados de todos os funcionários
      const allClosingsData: { [employeeId: string]: any } = {}

      employees.forEach((employee) => {
        const employeeData = localStorage.getItem(getStorageKey(employee.id))
        if (employeeData) {
          allClosingsData[employee.id] = JSON.parse(employeeData)
        }
      })

      const backupData: BackupData = {
        employees: employees,
        closings: allClosingsData,
        timestamp: Date.now(),
        date: new Date().toISOString().split("T")[0],
      }

      // Salvar backup com data
      const backupKey = `gasStationBackup_${backupData.date}`
      localStorage.setItem(backupKey, JSON.stringify(backupData))

      // Manter apenas os últimos 30 backups
      cleanOldBackups()

      // Salvar data do último backup
      localStorage.setItem("lastBackupDate", backupData.date)

      console.log(`Backup automático realizado com sucesso: ${backupData.date}`)

      // Mostrar notificação discreta (apenas no console para não interromper o usuário)
      if (currentEmployee) {
        console.log("✅ Backup diário realizado automaticamente")
      }
    } catch (error) {
      console.error("Erro no backup automático:", error)
    }
  }

  const cleanOldBackups = () => {
    try {
      const keys = Object.keys(localStorage).filter((key) => key.startsWith("gasStationBackup_"))

      if (keys.length > 30) {
        // Ordenar por data e manter apenas os 30 mais recentes
        const sortedKeys = keys.sort().slice(0, -30)
        sortedKeys.forEach((key) => {
          localStorage.removeItem(key)
        })
        console.log(`Removidos ${sortedKeys.length} backups antigos`)
      }
    } catch (error) {
      console.error("Erro ao limpar backups antigos:", error)
    }
  }

  const getAvailableBackups = (): string[] => {
    try {
      const keys = Object.keys(localStorage)
        .filter((key) => key.startsWith("gasStationBackup_"))
        .map((key) => key.replace("gasStationBackup_", ""))
        .sort()
        .reverse() // Mais recentes primeiro

      return keys
    } catch (error) {
      console.error("Erro ao listar backups:", error)
      return []
    }
  }

  const restoreFromBackup = (backupDate: string) => {
    try {
      const backupKey = `gasStationBackup_${backupDate}`
      const backupData = localStorage.getItem(backupKey)

      if (!backupData) {
        alert("Backup não encontrado!")
        return
      }

      const parsedBackup: BackupData = JSON.parse(backupData)

      if (
        confirm(
          `Tem certeza que deseja restaurar o backup de ${new Date(parsedBackup.timestamp).toLocaleString("pt-BR")}?\n\nISSO IRÁ SOBRESCREVER TODOS OS DADOS ATUAIS!`,
        )
      ) {
        // Restaurar funcionários
        localStorage.setItem("gasStationEmployees", JSON.stringify(parsedBackup.employees))
        setEmployees(parsedBackup.employees)

        // Restaurar fechamentos de todos os funcionários
        Object.entries(parsedBackup.closings).forEach(([employeeId, closingData]) => {
          localStorage.setItem(getStorageKey(employeeId), JSON.stringify(closingData))
        })

        alert("Backup restaurado com sucesso!")

        // Recarregar dados se houver usuário logado
        if (currentEmployee) {
          loadSavedDays()
          loadDayData(selectedDate)
        }
      }
    } catch (error) {
      console.error("Erro ao restaurar backup:", error)
      alert("Erro ao restaurar backup!")
    }
  }

  const exportBackup = (backupDate: string) => {
    try {
      const backupKey = `gasStationBackup_${backupDate}`
      const backupData = localStorage.getItem(backupKey)

      if (!backupData) {
        alert("Backup não encontrado!")
        return
      }

      const blob = new Blob([backupData], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `posto_backup_${backupDate}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      console.log(`Backup exportado: posto_backup_${backupDate}.json`)
    } catch (error) {
      console.error("Erro ao exportar backup:", error)
      alert("Erro ao exportar backup!")
    }
  }

  const manualBackup = () => {
    const now = new Date()
    const currentDate = now.toISOString().split("T")[0]
    const currentTime = now.toTimeString().split(" ")[0].replace(/:/g, "-")

    try {
      // Coletar dados de todos os funcionários
      const allClosingsData: { [employeeId: string]: any } = {}

      employees.forEach((employee) => {
        const employeeData = localStorage.getItem(getStorageKey(employee.id))
        if (employeeData) {
          allClosingsData[employee.id] = JSON.parse(employeeData)
        }
      })

      const backupData: BackupData = {
        employees: employees,
        closings: allClosingsData,
        timestamp: Date.now(),
        date: `${currentDate}_${currentTime}_manual`,
      }

      // Salvar backup manual
      const backupKey = `gasStationBackup_${backupData.date}`
      localStorage.setItem(backupKey, JSON.stringify(backupData))

      alert("Backup manual realizado com sucesso!")
      console.log(`Backup manual realizado: ${backupData.date}`)
    } catch (error) {
      console.error("Erro no backup manual:", error)
      alert("Erro ao realizar backup manual!")
    }
  }

  const loadAllEmployeeClosings = () => {
    if (currentEmployee?.role !== "gerente") return

    try {
      const allClosings: DailyClosing[] = []

      employees.forEach((employee) => {
        const employeeData = localStorage.getItem(getStorageKey(employee.id))
        if (employeeData) {
          const parsedData = JSON.parse(employeeData)
          const closingsArray = Object.values(parsedData) as DailyClosing[]
          allClosings.push(...closingsArray)
        }
      })

      // Ordenar por data mais recente
      allClosings.sort((a, b) => b.timestamp - a.timestamp)
      setAllEmployeeClosings(allClosings)
    } catch (error) {
      console.error("Erro ao carregar fechamentos de funcionários:", error)
    }
  }

  const editClosing = (closing: DailyClosing) => {
    setEditingClosing(closing)
    setCashDeposits(closing.cashDeposits)
    setPix(closing.pix)
    setVouchers(closing.vouchers)
    setProducts(closing.products)
    setSystem(closing.system)
    setCardAmounts(closing.cardAmounts)
    setShowEditDialog(true)
  }

  const saveEditedClosing = () => {
    if (!editingClosing || currentEmployee?.role !== "gerente") return

    try {
      const updatedClosing: DailyClosing = {
        ...editingClosing,
        cashDeposits,
        pix,
        vouchers,
        products,
        system,
        cardAmounts,
        balance: calculateBalance(),
        timestamp: Date.now(), // Atualizar timestamp da edição
      }

      // Salvar no localStorage do funcionário original
      const saved = localStorage.getItem(getStorageKey(editingClosing.employeeId))
      if (saved) {
        const allData = JSON.parse(saved)
        const dateKey = `${editingClosing.date}_${editingClosing.shift}`
        allData[dateKey] = updatedClosing
        localStorage.setItem(getStorageKey(editingClosing.employeeId), JSON.stringify(allData))
      }

      // Recarregar dados
      loadAllEmployeeClosings()
      if (currentEmployee.id === editingClosing.employeeId) {
        loadSavedDays()
      }

      setShowEditDialog(false)
      setEditingClosing(null)
      resetForm()
      alert("Fechamento editado com sucesso!")
    } catch (error) {
      console.error("Erro ao editar fechamento:", error)
      alert("Erro ao editar fechamento!")
    }
  }

  // Mobile input component with +/- buttons
  const MobileNumberInput = ({
    label,
    value,
    onChange,
    icon: Icon,
  }: {
    label: string
    value: number
    onChange: (value: number) => void
    icon: any
  }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            <Label className="text-sm font-medium">{label}</Label>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onChange(Math.max(0, value - 10))}
            className="h-10 w-10 p-0"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            step="0.01"
            value={value || ""}
            onChange={(e) => onChange(Number.parseFloat(e.target.value) || 0)}
            className="text-center text-lg font-medium"
            placeholder="0,00"
          />
          <Button variant="outline" size="sm" onClick={() => onChange(value + 10)} className="h-10 w-10 p-0">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-center mt-2 text-sm text-gray-500">{formatCurrency(value)}</div>
      </CardContent>
    </Card>
  )

  // Login Screen
  if (!currentEmployee) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Fuel className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold">Posto de Gasolina</h1>
            </div>
            <CardTitle>Sistema de Fechamento de Caixa</CardTitle>
            <CardDescription>
              {isLoginMode ? "Faça login para continuar" : "Cadastrar novo funcionário"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoginMode ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="employee">Funcionário</Label>
                  <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o funcionário" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees
                        .filter((emp) => emp.active)
                        .map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.name} ({employee.role})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pin">PIN</Label>
                  <div className="relative">
                    <Input
                      id="pin"
                      type={showPin ? "text" : "password"}
                      value={loginPin}
                      onChange={(e) => setLoginPin(e.target.value)}
                      placeholder="Digite seu PIN"
                      maxLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPin(!showPin)}
                    >
                      {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button onClick={handleLogin} className="w-full" disabled={!selectedEmployeeId || !loginPin}>
                  Entrar
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="newName">Nome Completo</Label>
                  <Input
                    id="newName"
                    value={newEmployeeName}
                    onChange={(e) => setNewEmployeeName(e.target.value)}
                    placeholder="Nome do funcionário"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPin">PIN (4-6 dígitos)</Label>
                  <Input
                    id="newPin"
                    type="password"
                    value={newEmployeePin}
                    onChange={(e) => setNewEmployeePin(e.target.value)}
                    placeholder="Criar PIN"
                    maxLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Função</Label>
                  <Select
                    value={newEmployeeRole}
                    onValueChange={(value: "funcionario" | "gerente") => setNewEmployeeRole(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="funcionario">Funcionário</SelectItem>
                      <SelectItem value="gerente">Gerente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleRegisterEmployee} className="w-full">
                  Cadastrar Funcionário
                </Button>
              </>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsLoginMode(!isLoginMode)} className="flex-1">
                {isLoginMode ? "Cadastrar Funcionário" : "Fazer Login"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>
            </div>

            {/* Employee Management for Managers */}
            {currentEmployee?.role === "gerente" && (
              <Dialog open={showEmployeeManagement} onOpenChange={setShowEmployeeManagement}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full bg-transparent">
                    <Users className="h-4 w-4 mr-2" />
                    Gerenciar Funcionários
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Gerenciar Funcionários</DialogTitle>
                    <DialogDescription>Ativar/desativar ou excluir funcionários</DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {employees.map((employee) => (
                        <Card key={employee.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{employee.name}</p>
                                <p className="text-sm text-gray-500 capitalize">{employee.role}</p>
                                <Badge variant={employee.active ? "default" : "secondary"} className="mt-1">
                                  {employee.active ? "Ativo" : "Inativo"}
                                </Badge>
                              </div>
                              <div className="flex gap-1">
                                <Button variant="outline" size="sm" onClick={() => toggleEmployeeStatus(employee.id)}>
                                  {employee.active ? "Desativar" : "Ativar"}
                                </Button>
                                {employee.role !== "gerente" && (
                                  <Button variant="destructive" size="sm" onClick={() => deleteEmployee(employee.id)}>
                                    Excluir
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  const getShiftName = (shift: string) => {
    switch (shift) {
      case "manha":
        return "Manhã (06:00-14:00)"
      case "intermediario1":
        return "Intermediário 1 (08:00-16:00)"
      case "intermediario2":
        return "Intermediário 2 (11:00-19:00)"
      case "tarde":
        return "Tarde (14:00-22:00)"
      case "noite":
        return "Noite (22:00-06:00)"
      default:
        return shift
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Fuel className="h-6 w-6 text-blue-600" />
            <div>
              <h1 className="text-lg font-semibold">Posto de Gasolina</h1>
              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-500">
                  {currentEmployee.name} - {currentEmployee.role}
                </p>
                {lastBackupDate && (
                  <Badge variant="outline" className="text-xs">
                    Backup: {new Date(lastBackupDate).toLocaleDateString("pt-BR")}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            {currentEmployee.role === "gerente" && (
              <Dialog open={showEmployeeManagement} onOpenChange={setShowEmployeeManagement}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Users className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Gerenciar Funcionários</DialogTitle>
                    <DialogDescription>Ativar/desativar ou excluir funcionários</DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {employees.map((employee) => (
                        <Card key={employee.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{employee.name}</p>
                                <p className="text-sm text-gray-500 capitalize">{employee.role}</p>
                                <Badge variant={employee.active ? "default" : "secondary"} className="mt-1">
                                  {employee.active ? "Ativo" : "Inativo"}
                                </Badge>
                              </div>
                              <div className="flex gap-1">
                                <Button variant="outline" size="sm" onClick={() => toggleEmployeeStatus(employee.id)}>
                                  {employee.active ? "Desativar" : "Ativar"}
                                </Button>
                                {employee.role !== "gerente" && (
                                  <Button variant="destructive" size="sm" onClick={() => deleteEmployee(employee.id)}>
                                    Excluir
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            )}
            {currentEmployee.role === "gerente" && (
              <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={loadAllEmployeeClosings}>
                    <Calculator className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[90vh] overflow-hidden flex flex-col">
                  <DialogHeader>
                    <DialogTitle>{editingClosing ? "Editar Fechamento" : "Gerenciar Fechamentos"}</DialogTitle>
                    <DialogDescription>
                      {editingClosing
                        ? `Editando fechamento de ${editingClosing.employeeName}`
                        : "Visualizar e editar fechamentos de funcionários"}
                    </DialogDescription>
                  </DialogHeader>

                  {editingClosing ? (
                    // Formulário de edição
                    <div className="space-y-4 flex-1 overflow-y-auto">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                        <p className="text-sm font-medium">{editingClosing.employeeName}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(editingClosing.date).toLocaleDateString("pt-BR")} -{" "}
                          {getShiftName(editingClosing.shift)}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm">Dinheiro</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={cashDeposits || ""}
                            onChange={(e) => setCashDeposits(Number.parseFloat(e.target.value) || 0)}
                            className="text-center"
                          />
                        </div>

                        <div>
                          <Label className="text-sm">PIX</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={pix || ""}
                            onChange={(e) => setPix(Number.parseFloat(e.target.value) || 0)}
                            className="text-center"
                          />
                        </div>

                        <div>
                          <Label className="text-sm">Vouchers</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={vouchers || ""}
                            onChange={(e) => setVouchers(Number.parseFloat(e.target.value) || 0)}
                            className="text-center"
                          />
                        </div>

                        <div>
                          <Label className="text-sm">Produtos</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={products || ""}
                            onChange={(e) => setProducts(Number.parseFloat(e.target.value) || 0)}
                            className="text-center"
                          />
                        </div>

                        <div>
                          <Label className="text-sm">Sistema</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={system || ""}
                            onChange={(e) => setSystem(Number.parseFloat(e.target.value) || 0)}
                            className="text-center"
                          />
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Cartões</Label>
                          {Object.entries(cardAmounts).map(([flag, amounts]) => (
                            <div key={flag} className="border rounded p-2">
                              <p className="text-xs font-medium mb-2 capitalize">
                                {flag === "others" ? "Outras" : flag}
                              </p>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <Label className="text-xs">Débito</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={amounts.debit || ""}
                                    onChange={(e) =>
                                      updateCardAmount(
                                        flag as keyof CardAmounts,
                                        "debit",
                                        Number.parseFloat(e.target.value) || 0,
                                      )
                                    }
                                    className="text-center text-xs h-8"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">Crédito</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={amounts.credit || ""}
                                    onChange={(e) =>
                                      updateCardAmount(
                                        flag as keyof CardAmounts,
                                        "credit",
                                        Number.parseFloat(e.target.value) || 0,
                                      )
                                    }
                                    className="text-center text-xs h-8"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <Separator />

                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Novo Saldo:</span>
                            <span
                              className={`font-bold ${calculateBalance() >= 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              {formatCurrency(calculateBalance())}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4 border-t">
                        <Button onClick={saveEditedClosing} className="flex-1">
                          Salvar Alterações
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowEditDialog(false)
                            setEditingClosing(null)
                            resetForm()
                          }}
                          className="flex-1"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Lista de fechamentos
                    <div className="space-y-4 flex-1 overflow-hidden">
                      <div className="space-y-2">
                        <Label className="text-sm">Filtrar por funcionário</Label>
                        <Select value={selectedEmployeeForEdit} onValueChange={setSelectedEmployeeForEdit}>
                          <SelectTrigger>
                            <SelectValue placeholder="Todos os funcionários" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Todos os funcionários</SelectItem>
                            {employees.map((employee) => (
                              <SelectItem key={employee.id} value={employee.id}>
                                {employee.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <ScrollArea className="flex-1 h-96">
                        <div className="space-y-2">
                          {allEmployeeClosings
                            .filter(
                              (closing) => !selectedEmployeeForEdit || closing.employeeId === selectedEmployeeForEdit,
                            )
                            .map((closing) => (
                              <Card key={closing.id} className="p-3">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">{closing.employeeName}</p>
                                    <p className="text-xs text-gray-500">
                                      {new Date(closing.date).toLocaleDateString("pt-BR")} -{" "}
                                      {getShiftName(closing.shift)}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      Salvo: {new Date(closing.timestamp).toLocaleString("pt-BR")}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p
                                      className={`font-bold text-sm ${closing.balance >= 0 ? "text-green-600" : "text-red-600"}`}
                                    >
                                      {formatCurrency(closing.balance)}
                                    </p>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => editClosing(closing)}
                                      className="mt-1 h-6 text-xs"
                                    >
                                      Editar
                                    </Button>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          {allEmployeeClosings.filter(
                            (closing) => !selectedEmployeeForEdit || closing.employeeId === selectedEmployeeForEdit,
                          ).length === 0 && (
                            <p className="text-center text-gray-500 py-8">Nenhum fechamento encontrado</p>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            )}
            {currentEmployee.role === "gerente" && (
              <Dialog open={showBackupDialog} onOpenChange={setShowBackupDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" title="Gerenciar Backups">
                    <Save className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Gerenciar Backups</DialogTitle>
                    <DialogDescription>
                      Backups automáticos diários às 00:01
                      {lastBackupDate && (
                        <div className="mt-2 text-sm">
                          Último backup: {new Date(lastBackupDate).toLocaleDateString("pt-BR")}
                        </div>
                      )}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Button onClick={manualBackup} className="w-full">
                      Fazer Backup Manual
                    </Button>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-2">Backups Disponíveis</h4>
                      <ScrollArea className="h-64">
                        <div className="space-y-2">
                          {getAvailableBackups().map((backupDate) => {
                            const isManual = backupDate.includes("manual")
                            const displayDate = isManual
                              ? backupDate.replace("_manual", "").replace(/_/g, " às ").replace(/-/g, ":")
                              : new Date(backupDate).toLocaleDateString("pt-BR")

                            return (
                              <Card key={backupDate} className="p-3">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="text-sm font-medium">{isManual ? "Manual" : "Automático"}</p>
                                    <p className="text-xs text-gray-500">{displayDate}</p>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => exportBackup(backupDate)}
                                      title="Exportar"
                                    >
                                      ⬇️
                                    </Button>
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      onClick={() => restoreFromBackup(backupDate)}
                                      title="Restaurar"
                                    >
                                      🔄
                                    </Button>
                                  </div>
                                </div>
                              </Card>
                            )
                          })}
                          {getAvailableBackups().length === 0 && (
                            <p className="text-center text-gray-500 py-4">Nenhum backup disponível</p>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            <Sheet open={isViewingHistory} onOpenChange={setIsViewingHistory}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <History className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Meu Histórico ({savedDays.length})</SheetTitle>
                  <SheetDescription>Seus fechamentos salvos</SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-full mt-4">
                  <div className="space-y-3">
                    {savedDays.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">Nenhum fechamento salvo</p>
                    ) : (
                      savedDays.map((day) => (
                        <Card key={day.id} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-sm">
                                  {new Date(day.date).toLocaleDateString("pt-BR", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                  })}
                                </p>
                                <p className="text-xs text-blue-600 dark:text-blue-400 capitalize">
                                  {getShiftName(day.shift)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p
                                  className={`font-bold text-sm ${day.balance >= 0 ? "text-green-600" : "text-red-600"}`}
                                >
                                  {formatCurrency(day.balance)}
                                </p>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    if (confirm("Excluir este fechamento?")) {
                                      deleteDayData(day)
                                    }
                                  }}
                                  className="mt-1 h-6 text-xs"
                                >
                                  Excluir
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Date Navigation and Shift Selection */}
        <div className="px-4 pb-4 space-y-3">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => navigateDate("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="text-center">
              <p className="text-sm font-medium">
                {selectedDate.toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </p>
              <div className="flex gap-1 mt-1 justify-center">
                {isToday && (
                  <Badge variant="default" className="text-xs">
                    Hoje
                  </Badge>
                )}
                {hasDataForSelectedDate && !isToday && (
                  <Badge variant="secondary" className="text-xs">
                    Salvo
                  </Badge>
                )}
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={() => navigateDate("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Shift Selection */}
          <div className="flex gap-2">
            <Label className="text-sm font-medium self-center">Turno:</Label>
            <Select value={selectedShift} onValueChange={setSelectedShift}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manha">Manhã (06:00-14:00)</SelectItem>
                <SelectItem value="intermediario1">Intermediário 1 (08:00-16:00)</SelectItem>
                <SelectItem value="intermediario2">Intermediário 2 (11:00-19:00)</SelectItem>
                <SelectItem value="tarde">Tarde (14:00-22:00)</SelectItem>
                <SelectItem value="noite">Noite (22:00-06:00)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal - Layout Vertical */}
      <div className="p-4 space-y-6">
        {/* Seção de Dados de Entrada */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Dados do Fechamento
            </CardTitle>
            <CardDescription>
              {currentEmployee.name} - Turno: {getShiftName(selectedShift)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <MobileNumberInput label="Dinheiro" value={cashDeposits} onChange={setCashDeposits} icon={DollarSign} />
            <MobileNumberInput label="PIX" value={pix} onChange={setPix} icon={Smartphone} />
            <MobileNumberInput label="Vouchers" value={vouchers} onChange={setVouchers} icon={Receipt} />
            <MobileNumberInput label="Produtos" value={products} onChange={setProducts} icon={Package} />
            <MobileNumberInput label="Sistema" value={system} onChange={setSystem} icon={Calculator} />
          </CardContent>
        </Card>

        {/* Seção de Cartões */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Cartões por Bandeira
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(cardAmounts).map(([flag, amounts]) => (
              <Card key={flag} className="border-dashed">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    {flag === "others" ? "Outras" : flag.toUpperCase()}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs text-gray-600">Débito</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateCardAmount(flag as keyof CardAmounts, "debit", Math.max(0, amounts.debit - 5))
                        }
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Input
                        type="number"
                        step="0.01"
                        value={amounts.debit || ""}
                        onChange={(e) =>
                          updateCardAmount(flag as keyof CardAmounts, "debit", Number.parseFloat(e.target.value) || 0)
                        }
                        className="text-center text-sm"
                        placeholder="0,00"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateCardAmount(flag as keyof CardAmounts, "debit", amounts.debit + 5)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-600">Crédito</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateCardAmount(flag as keyof CardAmounts, "credit", Math.max(0, amounts.credit - 5))
                        }
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Input
                        type="number"
                        step="0.01"
                        value={amounts.credit || ""}
                        onChange={(e) =>
                          updateCardAmount(flag as keyof CardAmounts, "credit", Number.parseFloat(e.target.value) || 0)
                        }
                        className="text-center text-sm"
                        placeholder="0,00"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateCardAmount(flag as keyof CardAmounts, "credit", amounts.credit + 5)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="text-center text-xs text-gray-500 pt-2 border-t">
                    Total: {formatCurrency(amounts.debit + amounts.credit)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Resumo Diário */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Fechamento Diário
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {currentEmployee.name} - Turno: {getShiftName(selectedShift)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Dinheiro:</span>
                <span className="font-medium">{formatCurrency(cashDeposits)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Cartões:</span>
                <span className="font-medium">{formatCurrency(cardsTotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">PIX:</span>
                <span className="font-medium">{formatCurrency(pix)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Vouchers:</span>
                <span className="font-medium">{formatCurrency(vouchers)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Sistema:</span>
                <span className="font-medium text-red-600">-{formatCurrency(system)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Produtos:</span>
                <span className="font-medium text-red-600">-{formatCurrency(products)}</span>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between items-center text-lg font-bold">
              <span>Saldo Final:</span>
              <span className={balance >= 0 ? "text-green-600" : "text-red-600"}>{formatCurrency(balance)}</span>
            </div>

            <div className="text-center">
              <Badge variant={balance >= 0 ? "default" : "destructive"} className="text-sm">
                {balance >= 0 ? "Caixa Positivo" : "Caixa Negativo"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Resumo Mensal */}
        {(() => {
          const monthlyData = getMonthlyData()
          return (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Fechamento Mensal
                </CardTitle>
                <CardDescription>
                  {selectedDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })} -{" "}
                  {currentEmployee.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Resumo Geral Mensal */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-500">Total do Mês</p>
                    <p
                      className={`font-bold text-lg ${monthlyData.totalBalance >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {formatCurrency(monthlyData.totalBalance)}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-500">Média Diária</p>
                    <p
                      className={`font-bold text-lg ${monthlyData.averageDaily >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {formatCurrency(monthlyData.averageDaily)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <p className="text-xs text-blue-600">Dias Fechados</p>
                    <p className="font-bold text-blue-600">{monthlyData.totalDays}</p>
                  </div>
                  <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                    <p className="text-xs text-green-600">Positivos</p>
                    <p className="font-bold text-green-600">{monthlyData.positivesDays}</p>
                  </div>
                  <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
                    <p className="text-xs text-red-600">Negativos</p>
                    <p className="font-bold text-red-600">{monthlyData.negativeDays}</p>
                  </div>
                </div>

                <div className="text-center">
                  <Badge
                    variant={monthlyData.totalBalance >= 0 ? "default" : "destructive"}
                    className="text-sm px-4 py-2"
                  >
                    {monthlyData.totalBalance >= 0 ? "Mês Positivo" : "Mês Negativo"}
                  </Badge>
                </div>

                {/* Performance do Mês */}
                {monthlyData.totalDays > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Performance do Mês</h4>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Dias Positivos</span>
                        <span>{Math.round((monthlyData.positivesDays / monthlyData.totalDays) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${(monthlyData.positivesDays / monthlyData.totalDays) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Dias Negativos</span>
                        <span>{Math.round((monthlyData.negativeDays / monthlyData.totalDays) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-600 h-2 rounded-full"
                          style={{
                            width: `${(monthlyData.negativeDays / monthlyData.totalDays) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Últimos Fechamentos do Mês */}
                {monthlyData.monthlyClosings.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Últimos Fechamentos</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {monthlyData.monthlyClosings
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 5)
                        .map((day) => (
                          <div key={day.id} className="flex justify-between items-center p-2 border rounded text-sm">
                            <div>
                              <p className="font-medium">
                                {new Date(day.date).toLocaleDateString("pt-BR", {
                                  day: "2-digit",
                                  month: "2-digit",
                                })}
                              </p>
                              <p className="text-xs text-gray-500 capitalize">{getShiftName(day.shift)}</p>
                            </div>
                            <div className="text-right">
                              <p className={`font-bold ${day.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                                {formatCurrency(day.balance)}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })()}
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t p-4 space-y-2">
        <Button onClick={saveDayData} className="w-full flex items-center justify-center gap-2">
          <Save className="h-4 w-4" />
          Salvar Fechamento
        </Button>
        <div className="flex gap-2">
          <Button onClick={resetForm} variant="outline" className="flex-1 bg-transparent">
            Limpar
          </Button>
          <Button onClick={goToToday} variant="outline" className="flex-1 bg-transparent">
            Hoje
          </Button>
        </div>
      </div>

      {/* Bottom padding to account for fixed buttons */}
      <div className="h-32"></div>
    </div>
  )
}

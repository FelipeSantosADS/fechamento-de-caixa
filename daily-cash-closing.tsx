"use client"

import { useState, useEffect } from "react"
import {
  Calendar,
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
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useTheme } from "next-themes"

interface CardAmounts {
  master: { debit: number; credit: number }
  visa: { debit: number; credit: number }
  elo: { debit: number; credit: number }
  amex: { debit: number; credit: number }
  others: { debit: number; credit: number }
}

interface DailyClosing {
  date: string
  personName: string
  cashDeposits: number
  pix: number
  vouchers: number
  products: number
  system: number
  cardAmounts: CardAmounts
  balance: number
  timestamp: number
}

export default function DailyCashClosing() {
  const { theme, setTheme } = useTheme()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isMonthActive, setIsMonthActive] = useState(false)
  const [savedDays, setSavedDays] = useState<DailyClosing[]>([])
  const [isViewingHistory, setIsViewingHistory] = useState(false)

  // Payment amounts
  const [cashDeposits, setCashDeposits] = useState(0)
  const [pix, setPix] = useState(0)
  const [vouchers, setVouchers] = useState(0)
  const [products, setProducts] = useState(0)
  const [system, setSystem] = useState(0)
  const [personName, setPersonName] = useState("")

  const [cardAmounts, setCardAmounts] = useState<CardAmounts>({
    master: { debit: 0, credit: 0 },
    visa: { debit: 0, credit: 0 },
    elo: { debit: 0, credit: 0 },
    amex: { debit: 0, credit: 0 },
    others: { debit: 0, credit: 0 },
  })

  // Load saved data on component mount
  useEffect(() => {
    loadSavedDays()
    loadDayData(selectedDate)
  }, [])

  // Check if we're in an active month
  useEffect(() => {
    const today = new Date()
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    setIsMonthActive(today >= firstDay && today <= lastDay)
  }, [])

  // Load day data when selected date changes
  useEffect(() => {
    loadDayData(selectedDate)
  }, [selectedDate])

  const getDateKey = (date: Date) => {
    return date.toISOString().split("T")[0]
  }

  const loadSavedDays = () => {
    try {
      const saved = localStorage.getItem("dailyClosings")
      if (saved) {
        const parsedData = JSON.parse(saved)
        const daysArray = Object.values(parsedData) as DailyClosing[]
        setSavedDays(daysArray.sort((a, b) => b.timestamp - a.timestamp))
      }
    } catch (error) {
      console.error("Erro ao carregar dias salvos:", error)
    }
  }

  const loadDayData = (date: Date) => {
    try {
      const saved = localStorage.getItem("dailyClosings")
      if (saved) {
        const parsedData = JSON.parse(saved)
        const dateKey = getDateKey(date)
        const dayData = parsedData[dateKey]

        if (dayData) {
          setPersonName(dayData.personName || "")
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
    try {
      const dateKey = getDateKey(selectedDate)
      const dayData: DailyClosing = {
        date: dateKey,
        personName,
        cashDeposits,
        pix,
        vouchers,
        products,
        system,
        cardAmounts,
        balance: calculateBalance(),
        timestamp: Date.now(),
      }

      const saved = localStorage.getItem("dailyClosings")
      const allData = saved ? JSON.parse(saved) : {}
      allData[dateKey] = dayData

      localStorage.setItem("dailyClosings", JSON.stringify(allData))
      loadSavedDays()

      alert("Fechamento salvo com sucesso!")
    } catch (error) {
      console.error("Erro ao salvar dados:", error)
      alert("Erro ao salvar os dados!")
    }
  }

  const deleteDayData = (dateKey: string) => {
    try {
      const saved = localStorage.getItem("dailyClosings")
      if (saved) {
        const allData = JSON.parse(saved)
        delete allData[dateKey]
        localStorage.setItem("dailyClosings", JSON.stringify(allData))
        loadSavedDays()

        // If we're viewing the deleted day, reset the form
        if (getDateKey(selectedDate) === dateKey) {
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

  const loadHistoricalDay = (dayData: DailyClosing) => {
    const date = new Date(dayData.date)
    setSelectedDate(date)
    setIsViewingHistory(false)
  }

  // Calculate total cards amount
  const calculateCardsTotal = () => {
    let total = 0
    Object.values(cardAmounts).forEach((card) => {
      total += card.debit + card.credit
    })
    return total
  }

  // Calculate final balance
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
    setPersonName("")
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

  const balance = calculateBalance()
  const cardsTotal = calculateCardsTotal()
  const isToday = getDateKey(selectedDate) === getDateKey(currentDate)
  const hasDataForSelectedDate = savedDays.some((day) => day.date === getDateKey(selectedDate))

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with Date Navigation */}
        <Card>
          <CardHeader className="text-center relative">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Calculator className="h-6 w-6" />
              Fechamento Diário de Caixa
            </CardTitle>
            <div className="absolute top-4 right-4">
              <Button variant="outline" size="sm" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Alternar tema</span>
              </Button>
            </div>

            {/* Date Navigation */}
            <div className="flex items-center justify-center gap-4 mt-4">
              <Button variant="outline" size="sm" onClick={() => navigateDate("prev")}>
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="text-center">
                <CardDescription className="flex items-center justify-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {selectedDate.toLocaleDateString("pt-BR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </CardDescription>
                {isToday && (
                  <Badge variant="default" className="mt-1">
                    Hoje
                  </Badge>
                )}
                {hasDataForSelectedDate && !isToday && (
                  <Badge variant="secondary" className="mt-1">
                    Dados Salvos
                  </Badge>
                )}
              </div>

              <Button variant="outline" size="sm" onClick={() => navigateDate("next")}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={goToToday}>
                Ir para Hoje
              </Button>

              <Dialog open={isViewingHistory} onOpenChange={setIsViewingHistory}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <History className="h-4 w-4 mr-1" />
                    Histórico ({savedDays.length})
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Histórico de Fechamentos</DialogTitle>
                    <DialogDescription>Clique em um dia para visualizar ou editar os dados</DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="h-96">
                    <div className="space-y-2">
                      {savedDays.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">Nenhum fechamento salvo ainda</p>
                      ) : (
                        savedDays.map((day) => (
                          <div
                            key={day.date}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                            onClick={() => loadHistoricalDay(day)}
                          >
                            <div>
                              <p className="font-medium">
                                {new Date(day.date).toLocaleDateString("pt-BR", {
                                  weekday: "long",
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </p>
                              {day.personName && (
                                <p className="text-sm text-blue-600 dark:text-blue-400">
                                  Responsável: {day.personName}
                                </p>
                              )}
                              <p className="text-sm text-gray-500">
                                Salvo em {new Date(day.timestamp).toLocaleString("pt-BR")}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={`font-bold ${day.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                                {formatCurrency(day.balance)}
                              </p>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (confirm("Tem certeza que deseja excluir este fechamento?")) {
                                    deleteDayData(day.date)
                                  }
                                }}
                              >
                                Excluir
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </div>

            {isMonthActive ? (
              <Badge variant="default" className="w-fit mx-auto mt-2">
                Mês Ativo
              </Badge>
            ) : (
              <Badge variant="secondary" className="w-fit mx-auto mt-2">
                Mês Fechado
              </Badge>
            )}
          </CardHeader>
        </Card>

        {/* Person Name */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Responsável pelo Fechamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="personName">Nome completo</Label>
              <Input
                id="personName"
                type="text"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="Digite seu nome completo"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Inputs */}
          <div className="space-y-6">
            {/* Cash Deposits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Depósitos em Dinheiro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="cash">Valor em R$</Label>
                  <Input
                    id="cash"
                    type="number"
                    step="0.01"
                    value={cashDeposits || ""}
                    onChange={(e) => setCashDeposits(Number.parseFloat(e.target.value) || 0)}
                    placeholder="0,00"
                  />
                </div>
              </CardContent>
            </Card>

            {/* PIX */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  PIX
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="pix">Valor em R$</Label>
                  <Input
                    id="pix"
                    type="number"
                    step="0.01"
                    value={pix || ""}
                    onChange={(e) => setPix(Number.parseFloat(e.target.value) || 0)}
                    placeholder="0,00"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Vouchers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Vouchers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="vouchers">Valor em R$</Label>
                  <Input
                    id="vouchers"
                    type="number"
                    step="0.01"
                    value={vouchers || ""}
                    onChange={(e) => setVouchers(Number.parseFloat(e.target.value) || 0)}
                    placeholder="0,00"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Produtos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="products">Valor em R$</Label>
                  <Input
                    id="products"
                    type="number"
                    step="0.01"
                    value={products || ""}
                    onChange={(e) => setProducts(Number.parseFloat(e.target.value) || 0)}
                    placeholder="0,00"
                  />
                </div>
              </CardContent>
            </Card>

            {/* System */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Sistema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="system">Valor em R$</Label>
                  <Input
                    id="system"
                    type="number"
                    step="0.01"
                    value={system || ""}
                    onChange={(e) => setSystem(Number.parseFloat(e.target.value) || 0)}
                    placeholder="0,00"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Cards */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Cartões por Bandeira
                </CardTitle>
                <CardDescription>Insira os valores para débito e crédito de cada bandeira</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(cardAmounts).map(([flag, amounts]) => (
                  <div key={flag} className="space-y-3">
                    <h4 className="font-medium capitalize text-sm text-gray-700 dark:text-gray-300">
                      {flag === "others" ? "Outras" : flag.toUpperCase()}
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor={`${flag}-debit`} className="text-xs">
                          Débito
                        </Label>
                        <Input
                          id={`${flag}-debit`}
                          type="number"
                          step="0.01"
                          value={amounts.debit || ""}
                          onChange={(e) =>
                            updateCardAmount(flag as keyof CardAmounts, "debit", Number.parseFloat(e.target.value) || 0)
                          }
                          placeholder="0,00"
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`${flag}-credit`} className="text-xs">
                          Crédito
                        </Label>
                        <Input
                          id={`${flag}-credit`}
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
                          placeholder="0,00"
                          className="text-sm"
                        />
                      </div>
                    </div>
                    {flag !== "others" && <Separator />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo do Fechamento</CardTitle>
            {personName && (
              <CardDescription className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Responsável: {personName}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className="flex justify-between">
                  <span>Dinheiro:</span>
                  <span className="font-medium">{formatCurrency(cashDeposits)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cartões:</span>
                  <span className="font-medium">{formatCurrency(cardsTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>PIX:</span>
                  <span className="font-medium">{formatCurrency(pix)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Vouchers:</span>
                  <span className="font-medium">{formatCurrency(vouchers)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sistema:</span>
                  <span className="font-medium text-red-600">-{formatCurrency(system)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Produtos:</span>
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
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 justify-center flex-wrap">
          <Button onClick={saveDayData} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Salvar Fechamento
          </Button>
          <Button onClick={resetForm} variant="outline">
            Limpar Formulário
          </Button>
          <Button onClick={() => window.print()} variant="outline">
            Imprimir Fechamento
          </Button>
        </div>
      </div>
    </div>
  )
}

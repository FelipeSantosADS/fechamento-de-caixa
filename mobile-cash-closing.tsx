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
  Plus,
  Minus,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

export default function MobileCashClosing() {
  const { theme, setTheme } = useTheme()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isMonthActive, setIsMonthActive] = useState(false)
  const [savedDays, setSavedDays] = useState<DailyClosing[]>([])
  const [isViewingHistory, setIsViewingHistory] = useState(false)
  const [activeTab, setActiveTab] = useState("dados")
  const [showMonthlyView, setShowMonthlyView] = useState(false)

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Calculator className="h-6 w-6" />
            <h1 className="text-lg font-semibold">Fechamento de Caixa</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowMonthlyView(true)}>
              <Calendar className="h-4 w-4" />
            </Button>
            <Sheet open={isViewingHistory} onOpenChange={setIsViewingHistory}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <History className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Histórico ({savedDays.length})</SheetTitle>
                  <SheetDescription>Toque em um dia para visualizar</SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-full mt-4">
                  <div className="space-y-3">
                    {savedDays.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">Nenhum fechamento salvo</p>
                    ) : (
                      savedDays.map((day) => (
                        <Card
                          key={day.date}
                          className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                          onClick={() => loadHistoricalDay(day)}
                        >
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
                                {day.personName && (
                                  <p className="text-xs text-blue-600 dark:text-blue-400">{day.personName}</p>
                                )}
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
                                      deleteDayData(day.date)
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
            <Sheet open={showMonthlyView} onOpenChange={setShowMonthlyView}>
              <SheetContent side="right" className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>
                    Resumo Mensal - {selectedDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                  </SheetTitle>
                  <SheetDescription>Análise completa do mês</SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-full mt-4">
                  <div className="space-y-4">
                    {(() => {
                      const monthlyData = getMonthlyData()
                      return (
                        <>
                          {/* Resumo Geral */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Resumo Geral</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Total do Mês:</span>
                                <span
                                  className={`font-bold text-lg ${monthlyData.totalBalance >= 0 ? "text-green-600" : "text-red-600"}`}
                                >
                                  {formatCurrency(monthlyData.totalBalance)}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Dias Fechados:</span>
                                <span className="font-medium">{monthlyData.totalDays}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Média Diária:</span>
                                <span
                                  className={`font-medium ${monthlyData.averageDaily >= 0 ? "text-green-600" : "text-red-600"}`}
                                >
                                  {formatCurrency(monthlyData.averageDaily)}
                                </span>
                              </div>
                              <Separator />
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Dias Positivos:</span>
                                <Badge variant="default">{monthlyData.positivesDays}</Badge>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Dias Negativos:</span>
                                <Badge variant="destructive">{monthlyData.negativeDays}</Badge>
                              </div>

                              <div className="text-center mt-4">
                                <Badge
                                  variant={monthlyData.totalBalance >= 0 ? "default" : "destructive"}
                                  className="text-sm px-4 py-2"
                                >
                                  {monthlyData.totalBalance >= 0 ? "Mês Positivo" : "Mês Negativo"}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Lista de Dias */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Fechamentos do Mês</CardTitle>
                            </CardHeader>
                            <CardContent>
                              {monthlyData.monthlyClosings.length === 0 ? (
                                <p className="text-center text-gray-500 py-4">Nenhum fechamento neste mês</p>
                              ) : (
                                <div className="space-y-2">
                                  {monthlyData.monthlyClosings
                                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                    .map((day) => (
                                      <div
                                        key={day.date}
                                        className="flex justify-between items-center p-3 border rounded-lg"
                                      >
                                        <div>
                                          <p className="font-medium text-sm">
                                            {new Date(day.date).toLocaleDateString("pt-BR", {
                                              day: "2-digit",
                                              month: "2-digit",
                                              weekday: "short",
                                            })}
                                          </p>
                                          {day.personName && <p className="text-xs text-gray-500">{day.personName}</p>}
                                        </div>
                                        <div className="text-right">
                                          <p
                                            className={`font-bold text-sm ${day.balance >= 0 ? "text-green-600" : "text-red-600"}`}
                                          >
                                            {formatCurrency(day.balance)}
                                          </p>
                                          <Badge
                                            variant={day.balance >= 0 ? "default" : "destructive"}
                                            className="text-xs mt-1"
                                          >
                                            {day.balance >= 0 ? "+" : "-"}
                                          </Badge>
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>

                          {/* Gráfico Simples de Performance */}
                          {monthlyData.totalDays > 0 && (
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Performance</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-3">
                                  <div>
                                    <div className="flex justify-between text-sm mb-1">
                                      <span>Dias Positivos</span>
                                      <span>
                                        {Math.round((monthlyData.positivesDays / monthlyData.totalDays) * 100)}%
                                      </span>
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
                                      <span>
                                        {Math.round((monthlyData.negativeDays / monthlyData.totalDays) * 100)}%
                                      </span>
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
                              </CardContent>
                            </Card>
                          )}
                        </>
                      )
                    })()}
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center justify-between px-4 pb-4">
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
            <div className="flex gap-1 mt-1">
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
              {isMonthActive && (
                <Badge variant="outline" className="text-xs">
                  Ativo
                </Badge>
              )}
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={() => navigateDate("next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Mobile Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mx-4 mt-4">
          <TabsTrigger value="dados">Dados</TabsTrigger>
          <TabsTrigger value="cartoes">Cartões</TabsTrigger>
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
        </TabsList>

        {/* Dados Tab */}
        <TabsContent value="dados" className="p-4 space-y-4">
          {/* Person Name */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <User className="h-4 w-4" />
                <Label className="text-sm font-medium">Responsável</Label>
              </div>
              <Input
                type="text"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="Seu nome completo"
                className="text-center"
              />
            </CardContent>
          </Card>

          <MobileNumberInput label="Dinheiro" value={cashDeposits} onChange={setCashDeposits} icon={DollarSign} />

          <MobileNumberInput label="PIX" value={pix} onChange={setPix} icon={Smartphone} />

          <MobileNumberInput label="Vouchers" value={vouchers} onChange={setVouchers} icon={Receipt} />

          <MobileNumberInput label="Produtos" value={products} onChange={setProducts} icon={Package} />

          <MobileNumberInput label="Sistema" value={system} onChange={setSystem} icon={Calculator} />
        </TabsContent>

        {/* Cartões Tab */}
        <TabsContent value="cartoes" className="p-4 space-y-4">
          {Object.entries(cardAmounts).map(([flag, amounts]) => (
            <Card key={flag}>
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
        </TabsContent>

        {/* Resumo Tab */}
        <TabsContent value="resumo" className="p-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumo do Fechamento</CardTitle>
              {personName && (
                <CardDescription className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {personName}
                </CardDescription>
              )}
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
        </TabsContent>
      </Tabs>

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

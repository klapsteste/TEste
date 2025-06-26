"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { LocalStorage } from "@/lib/storage"
import type { DashboardData } from "@/lib/types"
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Search,
  AlertTriangle,
  Users,
  Package,
  Activity,
  ArrowRight,
  ArrowLeft,
  Wrench,
  Download,
  BarChart3,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Calendar,
  User,
  FileText,
} from "lucide-react"

interface EPIInterface {
  id: number
  nome: string
  tipo: string
  ca: string
  validade: string
  status: "disponivel" | "em_uso" | "manutencao" | "descartado"
  estoque: number
  estoqueMinimo: number
  fabricante: string
}

interface Movimentacao {
  id: number
  epiId: number
  epiNome: string
  tipo: "entrega" | "devolucao" | "manutencao" | "descarte"
  funcionario: string
  matricula: string
  quantidade: number
  data: string
  observacao: string
  usuario: string
}

export default function SistemaEPI() {
  // Estados principais
  const [epis, setEpis] = useState<EPIInterface[]>([
    {
      id: 1,
      nome: "Capacete de Segurança Branco",
      tipo: "Proteção da Cabeça",
      ca: "CA-12345",
      validade: "2025-12-31",
      status: "disponivel",
      estoque: 50,
      estoqueMinimo: 10,
      fabricante: "3M",
    },
    {
      id: 2,
      nome: "Óculos de Proteção Incolor",
      tipo: "Proteção dos Olhos",
      ca: "CA-23456",
      validade: "2025-06-30",
      status: "em_uso",
      estoque: 8,
      estoqueMinimo: 15,
      fabricante: "Honeywell",
    },
    {
      id: 3,
      nome: "Luvas de Segurança Nitrílica",
      tipo: "Proteção das Mãos",
      ca: "CA-34567",
      validade: "2025-09-15",
      status: "disponivel",
      estoque: 100,
      estoqueMinimo: 25,
      fabricante: "Ansell",
    },
    {
      id: 4,
      nome: "Botina de Segurança com Bico",
      tipo: "Proteção dos Pés",
      ca: "CA-45678",
      validade: "2026-03-20",
      status: "disponivel",
      estoque: 5,
      estoqueMinimo: 15,
      fabricante: "Marluvas",
    },
    {
      id: 5,
      nome: "Protetor Auricular Tipo Concha",
      tipo: "Proteção Auditiva",
      ca: "CA-56789",
      validade: "2025-01-15",
      status: "manutencao",
      estoque: 25,
      estoqueMinimo: 10,
      fabricante: "3M",
    },
  ])

  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([
    {
      id: 1,
      epiId: 1,
      epiNome: "Capacete de Segurança Branco",
      tipo: "entrega",
      funcionario: "João Silva",
      matricula: "12345",
      quantidade: 2,
      data: "2024-12-15T14:30:00",
      observacao: "Entrega para obra setor A",
      usuario: "Administrador",
    },
    {
      id: 2,
      epiId: 2,
      epiNome: "Óculos de Proteção Incolor",
      tipo: "entrega",
      funcionario: "Maria Santos",
      matricula: "23456",
      quantidade: 1,
      data: "2024-12-14T09:15:00",
      observacao: "Substituição de EPI danificado",
      usuario: "Gerente",
    },
    {
      id: 3,
      epiId: 3,
      epiNome: "Luvas de Segurança Nitrílica",
      tipo: "devolucao",
      funcionario: "Pedro Costa",
      matricula: "34567",
      quantidade: 5,
      data: "2024-12-13T16:45:00",
      observacao: "Devolução após término do projeto",
      usuario: "Operador",
    },
    {
      id: 4,
      epiId: 5,
      epiNome: "Protetor Auricular Tipo Concha",
      tipo: "manutencao",
      funcionario: "",
      matricula: "",
      quantidade: 3,
      data: "2024-12-12T11:20:00",
      observacao: "Enviado para manutenção preventiva",
      usuario: "Administrador",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")
  const [tipoFilter, setTipoFilter] = useState("todos")
  const [showEpiDialog, setShowEpiDialog] = useState(false)
  const [showMovDialog, setShowMovDialog] = useState(false)
  const [editingEpi, setEditingEpi] = useState<EPIInterface | null>(null)
  const [viewingEpi, setViewingEpi] = useState<EPIInterface | null>(null)

  // Formulários
  const [epiForm, setEpiForm] = useState({
    nome: "",
    tipo: "",
    ca: "",
    validade: "",
    status: "disponivel" as const,
    estoque: 0,
    estoqueMinimo: 5,
    fabricante: "",
  })

  const [movForm, setMovForm] = useState({
    epiId: "",
    tipo: "entrega" as const,
    funcionario: "",
    matricula: "",
    quantidade: 1,
    observacao: "",
  })

  // Filtrar EPIs
  const filteredEpis = epis.filter((epi) => {
    const matchesSearch =
      epi.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      epi.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      epi.ca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      epi.fabricante.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "todos" || epi.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Filtrar Movimentações
  const filteredMovimentacoes = movimentacoes.filter((mov) => {
    return tipoFilter === "todos" || mov.tipo === tipoFilter
  })

  // Estatísticas
  const stats = {
    totalEpis: epis.length,
    episDisponivel: epis.filter((e) => e.status === "disponivel").length,
    episEmUso: epis.filter((e) => e.status === "em_uso").length,
    estoqueBaixo: epis.filter((e) => e.estoque <= e.estoqueMinimo).length,
    vencimentoProximo: epis.filter((e) => {
      const hoje = new Date()
      const vencimento = new Date(e.validade)
      const diasRestantes = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
      return diasRestantes <= 30 && diasRestantes >= 0
    }).length,
    movimentacoes: movimentacoes.length,
  }

  // Funções
  const handleEpiSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingEpi) {
      setEpis(epis.map((epi) => (epi.id === editingEpi.id ? { ...epi, ...epiForm } : epi)))
    } else {
      const newEpi: EPIInterface = {
        id: Math.max(...epis.map((e) => e.id), 0) + 1,
        ...epiForm,
      }
      setEpis([...epis, newEpi])
    }

    resetEpiForm()
    setShowEpiDialog(false)
    setEditingEpi(null)
  }

  const handleMovSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const selectedEpi = epis.find((epi) => epi.id === Number(movForm.epiId))
    if (!selectedEpi) return

    const newMov: Movimentacao = {
      id: Math.max(...movimentacoes.map((m) => m.id), 0) + 1,
      epiId: Number(movForm.epiId),
      epiNome: selectedEpi.nome,
      tipo: movForm.tipo,
      funcionario: movForm.funcionario,
      matricula: movForm.matricula,
      quantidade: movForm.quantidade,
      data: new Date().toISOString(),
      observacao: movForm.observacao,
      usuario: "Sistema",
    }

    setMovimentacoes([newMov, ...movimentacoes])

    // Atualizar estoque
    if (movForm.tipo === "entrega") {
      setEpis(
        epis.map((epi) =>
          epi.id === Number(movForm.epiId) ? { ...epi, estoque: Math.max(0, epi.estoque - movForm.quantidade) } : epi,
        ),
      )
    } else if (movForm.tipo === "devolucao") {
      setEpis(
        epis.map((epi) =>
          epi.id === Number(movForm.epiId) ? { ...epi, estoque: epi.estoque + movForm.quantidade } : epi,
        ),
      )
    }

    resetMovForm()
    setShowMovDialog(false)
  }

  const handleEditEpi = (epi: EPIInterface) => {
    setEditingEpi(epi)
    setEpiForm({
      nome: epi.nome,
      tipo: epi.tipo,
      ca: epi.ca,
      validade: epi.validade,
      status: epi.status,
      estoque: epi.estoque,
      estoqueMinimo: epi.estoqueMinimo,
      fabricante: epi.fabricante,
    })
    setShowEpiDialog(true)
  }

  const handleDeleteEpi = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este EPI?")) {
      setEpis(epis.filter((epi) => epi.id !== id))
      setMovimentacoes(movimentacoes.filter((mov) => mov.epiId !== id))
    }
  }

  const resetEpiForm = () => {
    setEpiForm({
      nome: "",
      tipo: "",
      ca: "",
      validade: "",
      status: "disponivel",
      estoque: 0,
      estoqueMinimo: 5,
      fabricante: "",
    })
  }

  const resetMovForm = () => {
    setMovForm({
      epiId: "",
      tipo: "entrega",
      funcionario: "",
      matricula: "",
      quantidade: 1,
      observacao: "",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "disponivel":
        return "bg-green-100 text-green-800"
      case "em_uso":
        return "bg-blue-100 text-blue-800"
      case "manutencao":
        return "bg-yellow-100 text-yellow-800"
      case "descartado":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "disponivel":
        return <CheckCircle className="h-4 w-4" />
      case "em_uso":
        return <Users className="h-4 w-4" />
      case "manutencao":
        return <Clock className="h-4 w-4" />
      case "descartado":
        return <XCircle className="h-4 w-4" />
      default:
        return <Shield className="h-4 w-4" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "disponivel":
        return "Disponível"
      case "em_uso":
        return "Em Uso"
      case "manutencao":
        return "Manutenção"
      case "descartado":
        return "Descartado"
      default:
        return status
    }
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "entrega":
        return <ArrowRight className="h-4 w-4" />
      case "devolucao":
        return <ArrowLeft className="h-4 w-4" />
      case "manutencao":
        return <Wrench className="h-4 w-4" />
      case "descarte":
        return <Trash2 className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "entrega":
        return "bg-blue-100 text-blue-800"
      case "devolucao":
        return "bg-green-100 text-green-800"
      case "manutencao":
        return "bg-yellow-100 text-yellow-800"
      case "descarte":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case "entrega":
        return "Entrega"
      case "devolucao":
        return "Devolução"
      case "manutencao":
        return "Manutenção"
      case "descarte":
        return "Descarte"
      default:
        return tipo
    }
  }

  const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) return

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header] || ""
            return typeof value === "string" && value.includes(",") ? `"${value}"` : value
          })
          .join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const isVencimentoProximo = (validade: string) => {
    const hoje = new Date()
    const vencimento = new Date(validade)
    const diasRestantes = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
    return diasRestantes <= 30 && diasRestantes >= 0
  }

  const isVencido = (validade: string) => {
    const hoje = new Date()
    const vencimento = new Date(validade)
    return vencimento < hoje
  }

  const [dashboardData, setDashboardData] = useState<DashboardData>({
    summary: {
      totalEpis: 0,
      activeEpis: 0,
      lowStock: 0,
      expiringSoon: 0,
      recentMovements: 0,
    },
    alerts: {
      lowStock: [],
      expiringSoon: [],
    },
  })

  useEffect(() => {
    const epis = LocalStorage.getEPIs() || []
    const movements = LocalStorage.getMovements() || []

    // Calcular estatísticas
    const activeEpis = epis.filter((epi) => epi.status === "ativo")
    const lowStockEpis = epis.filter((epi) => epi.estoque <= epi.estoqueMinimo)
    const expiringSoonEpis = epis.filter((epi) => isVencimentoProximo(epi.validade) || isVencido(epi.validade))

    // Movimentações dos últimos 7 dias
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const recentMovements = movements.filter((movement) => new Date(movement.data) >= sevenDaysAgo)

    setDashboardData({
      summary: {
        totalEpis: epis.length,
        activeEpis: activeEpis.length,
        lowStock: lowStockEpis.length,
        expiringSoon: expiringSoonEpis.length,
        recentMovements: recentMovements.length,
      },
      alerts: {
        lowStock: lowStockEpis,
        expiringSoon: expiringSoonEpis,
      },
    })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="h-12 w-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Sistema de Controle de EPIs</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Gerencie equipamentos de proteção individual de forma eficiente e segura
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total de EPIs</p>
                  <p className="text-3xl font-bold">{stats.totalEpis}</p>
                </div>
                <Shield className="h-10 w-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Disponíveis</p>
                  <p className="text-3xl font-bold">{stats.episDisponivel}</p>
                </div>
                <CheckCircle className="h-10 w-10 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100">Estoque Baixo</p>
                  <p className="text-3xl font-bold">{stats.estoqueBaixo}</p>
                </div>
                <AlertTriangle className="h-10 w-10 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Movimentações</p>
                  <p className="text-3xl font-bold">{stats.movimentacoes}</p>
                </div>
                <Activity className="h-10 w-10 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alertas */}
        <div className="space-y-3">
          {stats.estoqueBaixo > 0 && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Atenção!</strong> {stats.estoqueBaixo} EPI(s) com estoque abaixo do mínimo.
              </AlertDescription>
            </Alert>
          )}

          {stats.vencimentoProximo > 0 && (
            <Alert className="border-red-200 bg-red-50">
              <Clock className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Urgente!</strong> {stats.vencimentoProximo} EPI(s) com CA vencendo nos próximos 30 dias.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="epis" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              EPIs
            </TabsTrigger>
            <TabsTrigger value="movimentacoes" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Movimentações
            </TabsTrigger>
            <TabsTrigger value="relatorios" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Relatórios
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Resumo por Status */}
              <Card>
                <CardHeader>
                  <CardTitle>EPIs por Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-medium">Disponível</span>
                      </div>
                      <span className="text-2xl font-bold text-green-600">{stats.episDisponivel}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">Em Uso</span>
                      </div>
                      <span className="text-2xl font-bold text-blue-600">{stats.episEmUso}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-yellow-600" />
                        <span className="font-medium">Manutenção</span>
                      </div>
                      <span className="text-2xl font-bold text-yellow-600">
                        {epis.filter((e) => e.status === "manutencao").length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Movimentações Recentes */}
              <Card>
                <CardHeader>
                  <CardTitle>Movimentações Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {movimentacoes.slice(0, 5).map((mov) => (
                      <div key={mov.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge className={`${getTipoColor(mov.tipo)} flex items-center gap-1`}>
                            {getTipoIcon(mov.tipo)}
                            {getTipoLabel(mov.tipo)}
                          </Badge>
                          <div>
                            <p className="font-medium text-sm">{mov.epiNome}</p>
                            <p className="text-xs text-gray-600">{mov.funcionario}</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">{new Date(mov.data).toLocaleDateString("pt-BR")}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* EPIs com Estoque Baixo */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    Estoque Crítico
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {epis
                      .filter((epi) => epi.estoque <= epi.estoqueMinimo)
                      .map((epi) => (
                        <div key={epi.id} className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{epi.nome}</p>
                            <p className="text-xs text-gray-600">{epi.tipo}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-red-600">{epi.estoque}</p>
                            <p className="text-xs text-gray-500">Min: {epi.estoqueMinimo}</p>
                          </div>
                        </div>
                      ))}
                    {epis.filter((epi) => epi.estoque <= epi.estoqueMinimo).length === 0 && (
                      <p className="text-center text-gray-500 py-4">Nenhum EPI com estoque crítico</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Vencimentos Próximos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-red-600" />
                    Vencimentos Próximos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {epis
                      .filter((epi) => isVencimentoProximo(epi.validade) || isVencido(epi.validade))
                      .map((epi) => (
                        <div key={epi.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{epi.nome}</p>
                            <p className="text-xs text-gray-600">CA: {epi.ca}</p>
                          </div>
                          <div className="text-right">
                            <p
                              className={`text-sm font-bold ${isVencido(epi.validade) ? "text-red-600" : "text-yellow-600"}`}
                            >
                              {new Date(epi.validade).toLocaleDateString("pt-BR")}
                            </p>
                            <p className="text-xs text-gray-500">
                              {isVencido(epi.validade) ? "Vencido" : "Vence em breve"}
                            </p>
                          </div>
                        </div>
                      ))}
                    {epis.filter((epi) => isVencimentoProximo(epi.validade) || isVencido(epi.validade)).length ===
                      0 && <p className="text-center text-gray-500 py-4">Nenhum vencimento próximo</p>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* EPIs Tab */}
          <TabsContent value="epis" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gestão de EPIs</h2>
              <Dialog open={showEpiDialog} onOpenChange={setShowEpiDialog}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      resetEpiForm()
                      setEditingEpi(null)
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Novo EPI
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingEpi ? "Editar EPI" : "Novo EPI"}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleEpiSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="nome">Nome do EPI</Label>
                      <Input
                        id="nome"
                        placeholder="Ex: Capacete de Segurança"
                        value={epiForm.nome}
                        onChange={(e) => setEpiForm({ ...epiForm, nome: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="tipo">Tipo</Label>
                      <Input
                        id="tipo"
                        placeholder="Ex: Proteção da Cabeça"
                        value={epiForm.tipo}
                        onChange={(e) => setEpiForm({ ...epiForm, tipo: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="ca">Número CA</Label>
                      <Input
                        id="ca"
                        placeholder="Ex: CA-12345"
                        value={epiForm.ca}
                        onChange={(e) => setEpiForm({ ...epiForm, ca: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="fabricante">Fabricante</Label>
                      <Input
                        id="fabricante"
                        placeholder="Ex: 3M"
                        value={epiForm.fabricante}
                        onChange={(e) => setEpiForm({ ...epiForm, fabricante: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="validade">Validade do CA</Label>
                      <Input
                        id="validade"
                        type="date"
                        value={epiForm.validade}
                        onChange={(e) => setEpiForm({ ...epiForm, validade: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={epiForm.status}
                        onValueChange={(value: any) => setEpiForm({ ...epiForm, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="disponivel">Disponível</SelectItem>
                          <SelectItem value="em_uso">Em Uso</SelectItem>
                          <SelectItem value="manutencao">Manutenção</SelectItem>
                          <SelectItem value="descartado">Descartado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="estoque">Estoque</Label>
                        <Input
                          id="estoque"
                          type="number"
                          min="0"
                          value={epiForm.estoque}
                          onChange={(e) => setEpiForm({ ...epiForm, estoque: Number(e.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="estoqueMinimo">Estoque Mínimo</Label>
                        <Input
                          id="estoqueMinimo"
                          type="number"
                          min="0"
                          value={epiForm.estoqueMinimo}
                          onChange={(e) => setEpiForm({ ...epiForm, estoqueMinimo: Number(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setShowEpiDialog(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit">{editingEpi ? "Atualizar" : "Criar"}</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Filtros */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por nome, tipo, CA ou fabricante..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filtrar por status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Status</SelectItem>
                      <SelectItem value="disponivel">Disponível</SelectItem>
                      <SelectItem value="em_uso">Em Uso</SelectItem>
                      <SelectItem value="manutencao">Manutenção</SelectItem>
                      <SelectItem value="descartado">Descartado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Lista de EPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEpis.map((epi) => (
                <Card key={epi.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{epi.nome}</CardTitle>
                        <p className="text-sm text-gray-600">{epi.tipo}</p>
                        <p className="text-xs text-gray-500">{epi.fabricante}</p>
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => setViewingEpi(epi)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditEpi(epi)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteEpi(epi.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Status:</span>
                      <Badge className={`${getStatusColor(epi.status)} flex items-center gap-1`}>
                        {getStatusIcon(epi.status)}
                        {getStatusLabel(epi.status)}
                      </Badge>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">CA:</span>
                      <span className="text-sm font-medium">{epi.ca}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Validade:</span>
                      <span
                        className={`text-sm font-medium ${
                          isVencido(epi.validade)
                            ? "text-red-600"
                            : isVencimentoProximo(epi.validade)
                              ? "text-yellow-600"
                              : "text-gray-900"
                        }`}
                      >
                        {new Date(epi.validade).toLocaleDateString("pt-BR")}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Estoque:</span>
                      <div className="flex items-center gap-1">
                        <span
                          className={`text-sm font-medium ${
                            epi.estoque <= epi.estoqueMinimo ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          {epi.estoque}
                        </span>
                        {epi.estoque <= epi.estoqueMinimo && <AlertTriangle className="h-4 w-4 text-red-500" />}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredEpis.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum EPI encontrado</h3>
                  <p className="text-gray-600">
                    {searchTerm || statusFilter !== "todos"
                      ? "Tente ajustar os filtros de busca"
                      : "Comece adicionando um novo EPI"}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Modal de Visualização */}
            <Dialog open={!!viewingEpi} onOpenChange={() => setViewingEpi(null)}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Detalhes do EPI</DialogTitle>
                </DialogHeader>
                {viewingEpi && (
                  <div className="space-y-4">
                    <div>
                      <Label>Nome</Label>
                      <p className="font-medium">{viewingEpi.nome}</p>
                    </div>
                    <div>
                      <Label>Tipo</Label>
                      <p className="font-medium">{viewingEpi.tipo}</p>
                    </div>
                    <div>
                      <Label>Fabricante</Label>
                      <p className="font-medium">{viewingEpi.fabricante}</p>
                    </div>
                    <div>
                      <Label>Número CA</Label>
                      <p className="font-medium">{viewingEpi.ca}</p>
                    </div>
                    <div>
                      <Label>Validade do CA</Label>
                      <p
                        className={`font-medium ${
                          isVencido(viewingEpi.validade)
                            ? "text-red-600"
                            : isVencimentoProximo(viewingEpi.validade)
                              ? "text-yellow-600"
                              : "text-gray-900"
                        }`}
                      >
                        {new Date(viewingEpi.validade).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Badge className={`${getStatusColor(viewingEpi.status)} flex items-center gap-1 w-fit`}>
                        {getStatusIcon(viewingEpi.status)}
                        {getStatusLabel(viewingEpi.status)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Estoque Atual</Label>
                        <p
                          className={`font-medium text-lg ${
                            viewingEpi.estoque <= viewingEpi.estoqueMinimo ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          {viewingEpi.estoque}
                        </p>
                      </div>
                      <div>
                        <Label>Estoque Mínimo</Label>
                        <p className="font-medium text-lg">{viewingEpi.estoqueMinimo}</p>
                      </div>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Movimentações Tab */}
          <TabsContent value="movimentacoes" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Movimentações</h2>
              <Dialog open={showMovDialog} onOpenChange={setShowMovDialog}>
                <DialogTrigger asChild>
                  <Button onClick={resetMovForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Movimentação
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Nova Movimentação</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleMovSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="epi">EPI</Label>
                      <Select value={movForm.epiId} onValueChange={(value) => setMovForm({ ...movForm, epiId: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um EPI" />
                        </SelectTrigger>
                        <SelectContent>
                          {epis
                            .filter((epi) => epi.status !== "descartado")
                            .map((epi) => (
                              <SelectItem key={epi.id} value={epi.id.toString()}>
                                {epi.nome} (Estoque: {epi.estoque})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="tipo">Tipo de Movimentação</Label>
                      <Select
                        value={movForm.tipo}
                        onValueChange={(value: any) => setMovForm({ ...movForm, tipo: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entrega">Entrega</SelectItem>
                          <SelectItem value="devolucao">Devolução</SelectItem>
                          <SelectItem value="manutencao">Manutenção</SelectItem>
                          <SelectItem value="descarte">Descarte</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="quantidade">Quantidade</Label>
                      <Input
                        id="quantidade"
                        type="number"
                        min="1"
                        value={movForm.quantidade}
                        onChange={(e) => setMovForm({ ...movForm, quantidade: Number(e.target.value) || 1 })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="funcionario">Nome do Funcionário</Label>
                      <Input
                        id="funcionario"
                        placeholder="Nome completo"
                        value={movForm.funcionario}
                        onChange={(e) => setMovForm({ ...movForm, funcionario: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="matricula">Matrícula</Label>
                      <Input
                        id="matricula"
                        placeholder="Número da matrícula"
                        value={movForm.matricula}
                        onChange={(e) => setMovForm({ ...movForm, matricula: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="observacao">Observação</Label>
                      <Textarea
                        id="observacao"
                        placeholder="Observações adicionais..."
                        value={movForm.observacao}
                        onChange={(e) => setMovForm({ ...movForm, observacao: e.target.value })}
                        rows={3}
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setShowMovDialog(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit">Registrar</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Filtro de Movimentações */}
            <Card>
              <CardContent className="p-4">
                <div className="w-full md:w-48">
                  <Select value={tipoFilter} onValueChange={setTipoFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Tipos</SelectItem>
                      <SelectItem value="entrega">Entrega</SelectItem>
                      <SelectItem value="devolucao">Devolução</SelectItem>
                      <SelectItem value="manutencao">Manutenção</SelectItem>
                      <SelectItem value="descarte">Descarte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Movimentações */}
            <div className="space-y-4">
              {filteredMovimentacoes.map((mov) => (
                <Card key={mov.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center space-x-3">
                          <Badge className={`${getTipoColor(mov.tipo)} flex items-center gap-1`}>
                            {getTipoIcon(mov.tipo)}
                            {getTipoLabel(mov.tipo)}
                          </Badge>
                          <h3 className="text-lg font-semibold">{mov.epiNome}</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Package className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">Quantidade:</span>
                            <span className="font-medium">{mov.quantidade}</span>
                          </div>

                          {mov.funcionario && (
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">Funcionário:</span>
                              <span className="font-medium">{mov.funcionario}</span>
                            </div>
                          )}

                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">Data:</span>
                            <span className="font-medium">{new Date(mov.data).toLocaleString("pt-BR")}</span>
                          </div>
                        </div>

                        {mov.matricula && (
                          <div className="text-sm">
                            <span className="text-gray-600">Matrícula: </span>
                            <span className="font-medium">{mov.matricula}</span>
                          </div>
                        )}

                        {mov.observacao && (
                          <div className="text-sm">
                            <span className="text-gray-600">Observação: </span>
                            <span className="text-gray-800">{mov.observacao}</span>
                          </div>
                        )}

                        <div className="text-xs text-gray-500">Registrado por: {mov.usuario}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredMovimentacoes.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Activity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma movimentação encontrada</h3>
                  <p className="text-gray-600">
                    {tipoFilter !== "todos"
                      ? "Tente ajustar o filtro de tipo"
                      : "Comece registrando uma nova movimentação"}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Relatórios Tab */}
          <TabsContent value="relatorios" className="space-y-6">
            <h2 className="text-2xl font-bold">Relatórios</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    Relatório de EPIs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">Lista completa de todos os EPIs cadastrados no sistema</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-600">Total de registros:</span>
                    <span className="font-bold text-blue-600">{epis.length}</span>
                  </div>
                  <Button
                    onClick={() => downloadCSV(epis, "relatorio_epis.csv")}
                    className="w-full"
                    disabled={epis.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar CSV
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-600" />
                    Relatório de Movimentações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">Histórico completo de todas as movimentações registradas</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-600">Total de registros:</span>
                    <span className="font-bold text-green-600">{movimentacoes.length}</span>
                  </div>
                  <Button
                    onClick={() => downloadCSV(movimentacoes, "relatorio_movimentacoes.csv")}
                    className="w-full"
                    disabled={movimentacoes.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar CSV
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    Relatório de Estoque
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">EPIs com estoque abaixo do mínimo</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-600">EPIs críticos:</span>
                    <span className="font-bold text-yellow-600">{stats.estoqueBaixo}</span>
                  </div>
                  <Button
                    onClick={() =>
                      downloadCSV(
                        epis.filter((epi) => epi.estoque <= epi.estoqueMinimo),
                        "relatorio_estoque_critico.csv",
                      )
                    }
                    className="w-full"
                    disabled={stats.estoqueBaixo === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar CSV
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-red-600" />
                    Relatório de Vencimentos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">EPIs com CA vencido ou próximo ao vencimento</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-600">Vencimentos:</span>
                    <span className="font-bold text-red-600">{stats.vencimentoProximo}</span>
                  </div>
                  <Button
                    onClick={() =>
                      downloadCSV(
                        epis.filter((epi) => isVencimentoProximo(epi.validade) || isVencido(epi.validade)),
                        "relatorio_vencimentos.csv",
                      )
                    }
                    className="w-full"
                    disabled={stats.vencimentoProximo === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar CSV
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    Relatório Resumo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">Resumo geral do sistema com estatísticas</p>
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between">
                      <span>Total EPIs:</span>
                      <span className="font-bold">{stats.totalEpis}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Disponíveis:</span>
                      <span className="font-bold text-green-600">{stats.episDisponivel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Em Uso:</span>
                      <span className="font-bold text-blue-600">{stats.episEmUso}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estoque Baixo:</span>
                      <span className="font-bold text-yellow-600">{stats.estoqueBaixo}</span>
                    </div>
                  </div>
                  <Button
                    onClick={() =>
                      downloadCSV(
                        [
                          {
                            total_epis: stats.totalEpis,
                            disponiveis: stats.episDisponivel,
                            em_uso: stats.episEmUso,
                            manutencao: epis.filter((e) => e.status === "manutencao").length,
                            descartados: epis.filter((e) => e.status === "descartado").length,
                            estoque_baixo: stats.estoqueBaixo,
                            vencimentos_proximos: stats.vencimentoProximo,
                            total_movimentacoes: stats.movimentacoes,
                            data_relatorio: new Date().toLocaleDateString("pt-BR"),
                          },
                        ],
                        "relatorio_resumo.csv",
                      )
                    }
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar CSV
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Informações sobre os Relatórios:</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Os relatórios são gerados em tempo real com os dados mais atuais</li>
                    <li>Formato CSV pode ser aberto no Excel, Google Sheets ou LibreOffice</li>
                    <li>Os arquivos são baixados automaticamente após a geração</li>
                    <li>Dados incluem todas as informações relevantes para análise</li>
                    <li>Relatórios podem ser usados para auditoria e controle de qualidade</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

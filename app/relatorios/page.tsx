"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LocalStorage } from "@/lib/storage"
import type { EPI, Movement } from "@/lib/types"
import { formatDate, exportToCSV, isExpiringSoon, isExpired } from "@/lib/utils"
import { Download, FileText, Shield, ArrowUpDown, AlertTriangle, Package } from "lucide-react"

export default function RelatoriosPage() {
  const [epis, setEpis] = useState<EPI[]>([])
  const [movements, setMovements] = useState<Movement[]>([])
  const [stats, setStats] = useState({
    totalEpis: 0,
    activeEpis: 0,
    lowStock: 0,
    expiringSoon: 0,
    totalMovements: 0,
    recentMovements: 0,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const loadedEpis = LocalStorage.getEPIs()
    const loadedMovements = LocalStorage.getMovements()

    setEpis(loadedEpis)
    setMovements(loadedMovements)

    // Calcular estatísticas
    const activeEpis = loadedEpis.filter((epi) => epi.status === "ativo")
    const lowStockEpis = loadedEpis.filter((epi) => epi.stock_quantity <= epi.min_stock)
    const expiringSoonEpis = loadedEpis.filter((epi) => isExpiringSoon(epi.ca_validity) || isExpired(epi.ca_validity))

    // Movimentações dos últimos 7 dias
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const recentMovements = loadedMovements.filter((movement) => new Date(movement.movement_date) >= sevenDaysAgo)

    setStats({
      totalEpis: loadedEpis.length,
      activeEpis: activeEpis.length,
      lowStock: lowStockEpis.length,
      expiringSoon: expiringSoonEpis.length,
      totalMovements: loadedMovements.length,
      recentMovements: recentMovements.length,
    })
  }

  const exportEpisReport = () => {
    const reportData = epis.map((epi) => ({
      ID: epi.id,
      Nome: epi.name,
      Tipo: epi.type,
      "Número CA": epi.ca_number,
      Fabricante: epi.manufacturer,
      "Validade CA": formatDate(epi.ca_validity),
      Status: epi.status,
      "Estoque Atual": epi.stock_quantity,
      "Estoque Mínimo": epi.min_stock,
      "Data Criação": formatDate(epi.created_at),
    }))

    exportToCSV(reportData, "relatorio_epis.csv")
  }

  const exportMovementsReport = () => {
    const reportData = movements.map((movement) => ({
      ID: movement.id,
      EPI: movement.epi_name,
      Tipo: movement.type,
      Quantidade: movement.quantity,
      "Nome Funcionário": movement.employee_name,
      "Matrícula Funcionário": movement.employee_registration,
      "Usuário Sistema": movement.user_name,
      "Data Movimentação": formatDate(movement.movement_date),
      Observação: movement.observation || "",
    }))

    exportToCSV(reportData, "relatorio_movimentacoes.csv")
  }

  const exportLowStockReport = () => {
    const lowStockEpis = epis.filter((epi) => epi.stock_quantity <= epi.min_stock)
    const reportData = lowStockEpis.map((epi) => ({
      Nome: epi.name,
      Tipo: epi.type,
      "Estoque Atual": epi.stock_quantity,
      "Estoque Mínimo": epi.min_stock,
      Diferença: epi.min_stock - epi.stock_quantity,
      Status: epi.status,
    }))

    exportToCSV(reportData, "relatorio_estoque_baixo.csv")
  }

  const exportExpiringReport = () => {
    const expiringEpis = epis.filter((epi) => isExpiringSoon(epi.ca_validity) || isExpired(epi.ca_validity))
    const reportData = expiringEpis.map((epi) => ({
      Nome: epi.name,
      "Número CA": epi.ca_number,
      "Validade CA": formatDate(epi.ca_validity),
      Situação: isExpired(epi.ca_validity) ? "Vencido" : "Vencendo em breve",
      Status: epi.status,
    }))

    exportToCSV(reportData, "relatorio_vencimentos.csv")
  }

  const exportSummaryReport = () => {
    const reportData = [
      {
        "Total de EPIs": stats.totalEpis,
        "EPIs Ativos": stats.activeEpis,
        "EPIs com Estoque Baixo": stats.lowStock,
        "EPIs com CA Vencendo/Vencido": stats.expiringSoon,
        "Total de Movimentações": stats.totalMovements,
        "Movimentações Recentes (7 dias)": stats.recentMovements,
        "Data do Relatório": formatDate(new Date().toISOString().split("T")[0]),
      },
    ]

    exportToCSV(reportData, "relatorio_resumo.csv")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-gray-600">Gere e exporte relatórios detalhados do sistema</p>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de EPIs</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEpis}</div>
            <p className="text-xs text-muted-foreground">{stats.activeEpis} ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.lowStock + stats.expiringSoon}</div>
            <p className="text-xs text-muted-foreground">Estoque baixo + Vencimentos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Movimentações</CardTitle>
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMovements}</div>
            <p className="text-xs text-muted-foreground">{stats.recentMovements} nos últimos 7 dias</p>
          </CardContent>
        </Card>
      </div>

      {/* Relatórios Disponíveis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Relatório de EPIs
            </CardTitle>
            <CardDescription>Lista completa de todos os EPIs cadastrados no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-600">• Informações completas de cada EPI</p>
              <p className="text-sm text-gray-600">• Status, estoque e validades</p>
              <p className="text-sm text-gray-600">• Dados de fabricante e CA</p>
            </div>
            <Button onClick={exportEpisReport} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Exportar EPIs (CSV)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpDown className="h-5 w-5" />
              Relatório de Movimentações
            </CardTitle>
            <CardDescription>Histórico completo de todas as movimentações</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-600">• Entregas, devoluções e manutenções</p>
              <p className="text-sm text-gray-600">• Dados dos funcionários</p>
              <p className="text-sm text-gray-600">• Datas e observações</p>
            </div>
            <Button onClick={exportMovementsReport} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Exportar Movimentações (CSV)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-500" />
              Relatório de Estoque Crítico
            </CardTitle>
            <CardDescription>EPIs com estoque abaixo do mínimo estabelecido</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-600">• EPIs com estoque baixo</p>
              <p className="text-sm text-gray-600">• Comparação atual vs mínimo</p>
              <p className="text-sm text-gray-600">• Priorização por criticidade</p>
            </div>
            <Button
              onClick={exportLowStockReport}
              className="w-full"
              variant={stats.lowStock > 0 ? "default" : "outline"}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar Estoque Crítico (CSV)
            </Button>
            {stats.lowStock > 0 && (
              <Badge className="mt-2 bg-orange-100 text-orange-800">{stats.lowStock} EPIs com estoque baixo</Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Relatório de Vencimentos
            </CardTitle>
            <CardDescription>EPIs com CA vencido ou próximo do vencimento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-600">• CAs vencidos e vencendo</p>
              <p className="text-sm text-gray-600">• Datas de validade</p>
              <p className="text-sm text-gray-600">• Status de cada EPI</p>
            </div>
            <Button
              onClick={exportExpiringReport}
              className="w-full"
              variant={stats.expiringSoon > 0 ? "default" : "outline"}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar Vencimentos (CSV)
            </Button>
            {stats.expiringSoon > 0 && (
              <Badge className="mt-2 bg-red-100 text-red-800">{stats.expiringSoon} EPIs com CA vencendo/vencido</Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Relatório Resumo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Relatório Resumo Executivo
          </CardTitle>
          <CardDescription>Resumo geral com todas as estatísticas principais do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.totalEpis}</div>
              <div className="text-sm text-blue-800">Total EPIs</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.activeEpis}</div>
              <div className="text-sm text-green-800">EPIs Ativos</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{stats.lowStock}</div>
              <div className="text-sm text-orange-800">Estoque Baixo</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats.expiringSoon}</div>
              <div className="text-sm text-red-800">Vencimentos</div>
            </div>
          </div>
          <Button onClick={exportSummaryReport} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Exportar Resumo Executivo (CSV)
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

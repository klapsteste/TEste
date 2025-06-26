"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Layout from "@/components/Layout"
import { Shield, AlertTriangle, Clock, Users, Package, Activity } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts"

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"]

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser")
    if (currentUser) {
      setUser(JSON.parse(currentUser))
    } else {
      router.push("/login")
    }
  }, [router])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  // Dados simulados para o dashboard
  const stats = [
    {
      title: "Total de EPIs",
      value: "247",
      change: "+12%",
      changeType: "positive",
      icon: Shield,
      color: "bg-blue-500",
    },
    {
      title: "EPIs em Uso",
      value: "189",
      change: "+8%",
      changeType: "positive",
      icon: Users,
      color: "bg-green-500",
    },
    {
      title: "Estoque Baixo",
      value: "23",
      change: "-5%",
      changeType: "negative",
      icon: Package,
      color: "bg-yellow-500",
    },
    {
      title: "Vencimentos",
      value: "12",
      change: "+3%",
      changeType: "warning",
      icon: Clock,
      color: "bg-red-500",
    },
  ]

  const episByStatus = [
    { name: "Disponível", value: 58, color: "#10B981" },
    { name: "Em Uso", value: 189, color: "#3B82F6" },
    { name: "Manutenção", value: 15, color: "#F59E0B" },
    { name: "Descartado", value: 8, color: "#EF4444" },
  ]

  const movimentacoesMes = [
    { mes: "Jan", entregas: 45, devolucoes: 32 },
    { mes: "Fev", entregas: 52, devolucoes: 28 },
    { mes: "Mar", entregas: 48, devolucoes: 35 },
    { mes: "Abr", entregas: 61, devolucoes: 42 },
    { mes: "Mai", entregas: 55, devolucoes: 38 },
    { mes: "Jun", entregas: 67, devolucoes: 45 },
  ]

  const topEPIs = [
    { nome: "Capacete de Segurança", quantidade: 45 },
    { nome: "Óculos de Proteção", quantidade: 38 },
    { nome: "Luvas de Segurança", quantidade: 32 },
    { nome: "Botina de Segurança", quantidade: 28 },
    { nome: "Protetor Auricular", quantidade: 25 },
  ]

  const alertas = [
    { tipo: "warning", mensagem: "23 EPIs com estoque abaixo do mínimo" },
    { tipo: "error", mensagem: "12 EPIs com CA vencido ou próximo ao vencimento" },
    { tipo: "info", mensagem: "5 EPIs aguardando manutenção há mais de 30 dias" },
  ]

  return (
    <Layout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Visão geral do sistema de controle de EPIs</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p
                      className={`text-sm ${
                        stat.changeType === "positive"
                          ? "text-green-600"
                          : stat.changeType === "negative"
                            ? "text-red-600"
                            : "text-yellow-600"
                      }`}
                    >
                      {stat.change} vs mês anterior
                    </p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Alertas */}
        <div className="space-y-3">
          {alertas.map((alerta, index) => (
            <Alert
              key={index}
              className={
                alerta.tipo === "error"
                  ? "border-red-200 bg-red-50"
                  : alerta.tipo === "warning"
                    ? "border-yellow-200 bg-yellow-50"
                    : "border-blue-200 bg-blue-50"
              }
            >
              <AlertTriangle
                className={`h-4 w-4 ${
                  alerta.tipo === "error"
                    ? "text-red-600"
                    : alerta.tipo === "warning"
                      ? "text-yellow-600"
                      : "text-blue-600"
                }`}
              />
              <AlertDescription
                className={
                  alerta.tipo === "error"
                    ? "text-red-800"
                    : alerta.tipo === "warning"
                      ? "text-yellow-800"
                      : "text-blue-800"
                }
              >
                {alerta.mensagem}
              </AlertDescription>
            </Alert>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* EPIs por Status */}
          <Card>
            <CardHeader>
              <CardTitle>EPIs por Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={episByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {episByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Movimentações por Mês */}
          <Card>
            <CardHeader>
              <CardTitle>Movimentações Mensais</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={movimentacoesMes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="entregas"
                    stackId="1"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="devolucoes"
                    stackId="1"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top EPIs */}
          <Card>
            <CardHeader>
              <CardTitle>EPIs Mais Utilizados</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topEPIs} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="nome" type="category" width={120} />
                  <Tooltip />
                  <Bar dataKey="quantidade" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Atividade Recente */}
          <Card>
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { acao: "Entrega", epi: "Capacete de Segurança", funcionario: "João Silva", tempo: "2 min atrás" },
                  { acao: "Devolução", epi: "Óculos de Proteção", funcionario: "Maria Santos", tempo: "15 min atrás" },
                  { acao: "Cadastro", epi: "Luvas Nitrílicas", funcionario: "Admin", tempo: "1 hora atrás" },
                  {
                    acao: "Manutenção",
                    epi: "Botina de Segurança",
                    funcionario: "Pedro Costa",
                    tempo: "2 horas atrás",
                  },
                  { acao: "Entrega", epi: "Protetor Auricular", funcionario: "Ana Oliveira", tempo: "3 horas atrás" },
                ].map((atividade, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-full ${
                          atividade.acao === "Entrega"
                            ? "bg-blue-100"
                            : atividade.acao === "Devolução"
                              ? "bg-green-100"
                              : atividade.acao === "Cadastro"
                                ? "bg-purple-100"
                                : "bg-yellow-100"
                        }`}
                      >
                        <Activity
                          className={`h-4 w-4 ${
                            atividade.acao === "Entrega"
                              ? "text-blue-600"
                              : atividade.acao === "Devolução"
                                ? "text-green-600"
                                : atividade.acao === "Cadastro"
                                  ? "text-purple-600"
                                  : "text-yellow-600"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {atividade.acao} - {atividade.epi}
                        </p>
                        <p className="text-xs text-gray-600">{atividade.funcionario}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{atividade.tempo}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Layout from "@/components/Layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, FileText, Info } from "lucide-react"
import toast from "react-hot-toast"

const mockEPIs = [
  { id: 1, name: "Capacete de Segurança", type: "Proteção da Cabeça", ca_number: "CA-12345", status: "disponivel" },
  { id: 2, name: "Óculos de Proteção", type: "Proteção dos Olhos", ca_number: "CA-23456", status: "disponivel" },
]

const mockMovements = [
  { id: 1, epi_name: "Capacete", type: "entrega", quantity: 2, employee_name: "João Silva" },
  { id: 2, epi_name: "Óculos", type: "entrega", quantity: 1, employee_name: "Maria Santos" },
]

export default function Reports() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const savedUser = localStorage.getItem("epi-user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    } else {
      router.push("/login")
    }
  }, [router])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const canAccessReports = user?.role === "admin" || user?.role === "gerente"

  const downloadCSV = (data: any[], filename: string, headers: string[]) => {
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

    toast.success("Relatório baixado com sucesso!")
  }

  const downloadEPIsReport = () => {
    const headers = ["id", "name", "type", "ca_number", "status"]
    downloadCSV(mockEPIs, "relatorio_epis.csv", headers)
  }

  const downloadMovementsReport = () => {
    const headers = ["id", "epi_name", "type", "quantity", "employee_name"]
    downloadCSV(mockMovements, "relatorio_movimentacoes.csv", headers)
  }

  if (!canAccessReports) {
    return (
      <Layout user={user}>
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Acesso Restrito</h3>
          <p className="mt-1 text-sm text-gray-500">Você não tem permissão para acessar os relatórios.</p>
        </div>
      </Layout>
    )
  }

  const reports = [
    {
      title: "Relatório de EPIs",
      description: "Lista completa de todos os EPIs cadastrados no sistema",
      action: downloadEPIsReport,
      count: mockEPIs.length,
    },
    {
      title: "Relatório de Movimentações",
      description: "Histórico completo de todas as movimentações registradas",
      action: downloadMovementsReport,
      count: mockMovements.length,
    },
  ]

  return (
    <Layout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="mt-1 text-sm text-gray-600">Gere e baixe relatórios do sistema de controle de EPIs</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {reports.map((report, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <FileText className="h-6 w-6 text-blue-600" />
                  <CardTitle>{report.title}</CardTitle>
                </div>
                <CardDescription>{report.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600">
                  <p>
                    <strong>Total de registros:</strong> {report.count}
                  </p>
                  <p>
                    <strong>Formato:</strong> CSV
                  </p>
                </div>

                <Button onClick={report.action} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Baixar CSV
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Informações sobre Relatórios:</strong>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Os relatórios são gerados em tempo real com os dados mais atuais</li>
              <li>Formato CSV pode ser aberto no Excel ou Google Sheets</li>
              <li>Apenas usuários com perfil Admin ou Gerente podem gerar relatórios</li>
              <li>Os arquivos são baixados automaticamente após a geração</li>
            </ul>
          </AlertDescription>
        </Alert>
      </div>
    </Layout>
  )
}

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Layout from "@/components/Layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, ArrowRightLeft } from "lucide-react"
import toast from "react-hot-toast"

const initialMovements = [
  {
    id: 1,
    epi_id: 1,
    epi_name: "Capacete de Segurança Branco",
    user_name: "Administrador",
    type: "entrega",
    quantity: 2,
    employee_name: "João Silva",
    employee_registration: "12345",
    observation: "Entrega para obra setor A",
    movement_date: "2024-12-15T14:30:00Z",
  },
  {
    id: 2,
    epi_id: 2,
    epi_name: "Óculos de Proteção",
    user_name: "Gerente Segurança",
    type: "entrega",
    quantity: 1,
    employee_name: "Maria Santos",
    employee_registration: "23456",
    observation: "Substituição de EPI danificado",
    movement_date: "2024-12-14T09:15:00Z",
  },
  {
    id: 3,
    epi_id: 3,
    epi_name: "Luva de Segurança",
    user_name: "Operador",
    type: "devolucao",
    quantity: 5,
    employee_name: "Pedro Costa",
    employee_registration: "34567",
    observation: "Devolução após término do projeto",
    movement_date: "2024-12-13T16:45:00Z",
  },
]

const epis = [
  { id: 1, name: "Capacete de Segurança Branco", stock_quantity: 50 },
  { id: 2, name: "Óculos de Proteção", stock_quantity: 30 },
  { id: 3, name: "Luva de Segurança", stock_quantity: 100 },
  { id: 4, name: "Botina de Segurança", stock_quantity: 3 },
  { id: 5, name: "Protetor Auricular", stock_quantity: 25 },
]

export default function Movements() {
  const [user, setUser] = useState<any>(null)
  const [movements, setMovements] = useState(initialMovements)
  const [filteredMovements, setFilteredMovements] = useState(initialMovements)
  const [typeFilter, setTypeFilter] = useState("")
  const [epiFilter, setEpiFilter] = useState("")
  const [showModal, setShowModal] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    epi_id: "",
    type: "entrega",
    quantity: 1,
    employee_name: "",
    employee_registration: "",
    observation: "",
  })

  useEffect(() => {
    const savedUser = localStorage.getItem("epi-user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    } else {
      router.push("/login")
    }
  }, [router])

  useEffect(() => {
    let filtered = movements

    if (typeFilter) {
      filtered = filtered.filter((movement) => movement.type === typeFilter)
    }

    if (epiFilter) {
      filtered = filtered.filter((movement) => movement.epi_id.toString() === epiFilter)
    }

    setFilteredMovements(filtered)
  }, [movements, typeFilter, epiFilter])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const selectedEpi = epis.find((epi) => epi.id.toString() === formData.epi_id)
    if (!selectedEpi) {
      toast.error("EPI não encontrado")
      return
    }

    const newMovement = {
      id: Math.max(...movements.map((m) => m.id)) + 1,
      epi_id: Number.parseInt(formData.epi_id),
      epi_name: selectedEpi.name,
      user_name: user.name,
      type: formData.type,
      quantity: formData.quantity,
      employee_name: formData.employee_name,
      employee_registration: formData.employee_registration,
      observation: formData.observation,
      movement_date: new Date().toISOString(),
    }

    setMovements((prev) => [newMovement, ...prev])
    toast.success("Movimentação registrada com sucesso!")

    setShowModal(false)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      epi_id: "",
      type: "entrega",
      quantity: 1,
      employee_name: "",
      employee_registration: "",
      observation: "",
    })
  }

  const getTypeColor = (type: string) => {
    const colors = {
      entrega: "bg-blue-100 text-blue-800",
      devolucao: "bg-green-100 text-green-800",
      manutencao: "bg-yellow-100 text-yellow-800",
      descarte: "bg-red-100 text-red-800",
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getTypeLabel = (type: string) => {
    const labels = {
      entrega: "Entrega",
      devolucao: "Devolução",
      manutencao: "Manutenção",
      descarte: "Descarte",
    }
    return labels[type as keyof typeof labels] || type
  }

  return (
    <Layout user={user}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Movimentações</h1>
            <p className="mt-1 text-sm text-gray-600">Controle de entrega, devolução e manutenção de EPIs</p>
          </div>
          <Dialog open={showModal} onOpenChange={setShowModal}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Movimentação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Nova Movimentação</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="epi_id">EPI</Label>
                  <Select
                    value={formData.epi_id}
                    onValueChange={(value) => setFormData({ ...formData, epi_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um EPI" />
                    </SelectTrigger>
                    <SelectContent>
                      {epis.map((epi) => (
                        <SelectItem key={epi.id} value={epi.id.toString()}>
                          {epi.name} - Estoque: {epi.stock_quantity}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="type">Tipo de Movimentação</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
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
                  <Label htmlFor="quantity">Quantidade</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number.parseInt(e.target.value) || 1 })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="employee_name">Nome do Funcionário</Label>
                  <Input
                    id="employee_name"
                    value={formData.employee_name}
                    onChange={(e) => setFormData({ ...formData, employee_name: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="employee_registration">Matrícula do Funcionário</Label>
                  <Input
                    id="employee_registration"
                    value={formData.employee_registration}
                    onChange={(e) => setFormData({ ...formData, employee_registration: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="observation">Observação</Label>
                  <Textarea
                    id="observation"
                    value={formData.observation}
                    onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Registrar</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type-filter">Tipo</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    <SelectItem value="entrega">Entrega</SelectItem>
                    <SelectItem value="devolucao">Devolução</SelectItem>
                    <SelectItem value="manutencao">Manutenção</SelectItem>
                    <SelectItem value="descarte">Descarte</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="epi-filter">EPI</Label>
                <Select value={epiFilter} onValueChange={setEpiFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    {epis.map((epi) => (
                      <SelectItem key={epi.id} value={epi.id.toString()}>
                        {epi.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Movimentações */}
        <div className="space-y-4">
          {filteredMovements.map((movement) => (
            <Card key={movement.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium">{movement.epi_name}</h3>
                      <Badge className={getTypeColor(movement.type)}>{getTypeLabel(movement.type)}</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <p className="font-medium">Quantidade</p>
                        <p>{movement.quantity}</p>
                      </div>

                      {movement.employee_name && (
                        <div>
                          <p className="font-medium">Funcionário</p>
                          <p>{movement.employee_name}</p>
                          {movement.employee_registration && (
                            <p className="text-xs">Mat: {movement.employee_registration}</p>
                          )}
                        </div>
                      )}

                      <div>
                        <p className="font-medium">Usuário</p>
                        <p>{movement.user_name}</p>
                      </div>
                    </div>

                    {movement.observation && (
                      <div className="text-sm">
                        <p className="font-medium text-gray-600">Observação</p>
                        <p className="text-gray-500">{movement.observation}</p>
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-500">{new Date(movement.movement_date).toLocaleString("pt-BR")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMovements.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <ArrowRightLeft className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma movimentação encontrada</h3>
              <p className="mt-1 text-sm text-gray-500">
                {typeFilter || epiFilter ? "Tente ajustar os filtros." : "Comece registrando uma nova movimentação."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  )
}

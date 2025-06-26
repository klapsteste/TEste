"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { LocalStorage } from "@/lib/storage"
import type { EPI, Movement } from "@/lib/types"
import { formatDate, getMovementTypeColor } from "@/lib/utils"
import { Plus, Search, ArrowUpDown, User, Calendar } from "lucide-react"

export default function MovimentacoesPage() {
  const [movements, setMovements] = useState<Movement[]>([])
  const [filteredMovements, setFilteredMovements] = useState<Movement[]>([])
  const [epis, setEpis] = useState<EPI[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    epi_id: "",
    type: "entrega" as const,
    quantity: 1,
    employee_name: "",
    employee_registration: "",
    observation: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterMovements()
  }, [movements, searchTerm, typeFilter])

  const loadData = () => {
    const loadedMovements = LocalStorage.getMovements()
    const loadedEpis = LocalStorage.getEPIs()
    setMovements(loadedMovements)
    setEpis(loadedEpis)
  }

  const filterMovements = () => {
    let filtered = movements

    if (searchTerm) {
      filtered = filtered.filter(
        (movement) =>
          movement.epi_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          movement.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          movement.employee_registration.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((movement) => movement.type === typeFilter)
    }

    setFilteredMovements(filtered)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    LocalStorage.addMovement({
      ...formData,
      user_name: "Usuário Sistema",
    })

    loadData()
    resetForm()
    setIsDialogOpen(false)
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

  const getMovementTypeLabel = (type: string) => {
    const labels = {
      entrega: "Entrega",
      devolucao: "Devolução",
      manutencao: "Manutenção",
      descarte: "Descarte",
    }
    return labels[type as keyof typeof labels] || type
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Movimentações</h1>
          <p className="text-gray-600">Registre e acompanhe todas as movimentações de EPIs</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Movimentação
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Nova Movimentação</DialogTitle>
              <DialogDescription>Registre uma nova movimentação de EPI</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="epi_id" className="text-right">
                    EPI
                  </Label>
                  <Select
                    value={formData.epi_id}
                    onValueChange={(value) => setFormData({ ...formData, epi_id: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Selecione um EPI" />
                    </SelectTrigger>
                    <SelectContent>
                      {epis
                        .filter((epi) => epi.status === "ativo")
                        .map((epi) => (
                          <SelectItem key={epi.id} value={epi.id}>
                            {epi.name} (Estoque: {epi.stock_quantity})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Tipo
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger className="col-span-3">
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
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="quantity" className="text-right">
                    Quantidade
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number.parseInt(e.target.value) || 1 })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="employee_name" className="text-right">
                    Funcionário
                  </Label>
                  <Input
                    id="employee_name"
                    value={formData.employee_name}
                    onChange={(e) => setFormData({ ...formData, employee_name: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="employee_registration" className="text-right">
                    Matrícula
                  </Label>
                  <Input
                    id="employee_registration"
                    value={formData.employee_registration}
                    onChange={(e) => setFormData({ ...formData, employee_registration: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="observation" className="text-right">
                    Observação
                  </Label>
                  <Textarea
                    id="observation"
                    value={formData.observation}
                    onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
                    className="col-span-3"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Registrar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar movimentações..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="entrega">Entrega</SelectItem>
            <SelectItem value="devolucao">Devolução</SelectItem>
            <SelectItem value="manutencao">Manutenção</SelectItem>
            <SelectItem value="descarte">Descarte</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Movimentações */}
      <div className="space-y-4">
        {filteredMovements.map((movement) => (
          <Card key={movement.id}>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className={getMovementTypeColor(movement.type)}>{getMovementTypeLabel(movement.type)}</Badge>
                    <span className="font-semibold text-lg">{movement.epi_name}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{movement.employee_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Matrícula: {movement.employee_registration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(movement.movement_date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="h-4 w-4" />
                      <span>Qtd: {movement.quantity}</span>
                    </div>
                  </div>
                  {movement.observation && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>Observação:</strong> {movement.observation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMovements.length === 0 && (
        <div className="text-center py-12">
          <ArrowUpDown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma movimentação encontrada</h3>
          <p className="text-gray-600">
            {searchTerm || typeFilter !== "all"
              ? "Tente ajustar os filtros de busca"
              : "Comece registrando uma nova movimentação"}
          </p>
        </div>
      )}
    </div>
  )
}

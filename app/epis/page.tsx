"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { LocalStorage } from "@/lib/storage"
import type { EPI } from "@/lib/types"
import { formatDate, getStatusColor, isExpiringSoon, isExpired } from "@/lib/utils"
import { Plus, Search, Edit, Trash2, AlertTriangle, Package, Shield } from "lucide-react"

export default function EPIsPage() {
  const [epis, setEpis] = useState<EPI[]>([])
  const [filteredEpis, setFilteredEpis] = useState<EPI[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEpi, setEditingEpi] = useState<EPI | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    ca_number: "",
    manufacturer: "",
    ca_validity: "",
    status: "ativo" as const,
    stock_quantity: 0,
    min_stock: 5,
  })

  useEffect(() => {
    loadEpis()
  }, [])

  useEffect(() => {
    filterEpis()
  }, [epis, searchTerm, statusFilter])

  const loadEpis = () => {
    const loadedEpis = LocalStorage.getEPIs()
    setEpis(loadedEpis)
  }

  const filterEpis = () => {
    let filtered = epis

    if (searchTerm) {
      filtered = filtered.filter(
        (epi) =>
          epi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          epi.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          epi.ca_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          epi.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((epi) => epi.status === statusFilter)
    }

    setFilteredEpis(filtered)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingEpi) {
      LocalStorage.updateEPI(editingEpi.id, formData)
    } else {
      LocalStorage.addEPI(formData)
    }

    loadEpis()
    resetForm()
    setIsDialogOpen(false)
  }

  const handleEdit = (epi: EPI) => {
    setEditingEpi(epi)
    setFormData({
      name: epi.name,
      type: epi.type,
      ca_number: epi.ca_number,
      manufacturer: epi.manufacturer,
      ca_validity: epi.ca_validity,
      status: epi.status,
      stock_quantity: epi.stock_quantity,
      min_stock: epi.min_stock,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    LocalStorage.deleteEPI(id)
    loadEpis()
  }

  const resetForm = () => {
    setEditingEpi(null)
    setFormData({
      name: "",
      type: "",
      ca_number: "",
      manufacturer: "",
      ca_validity: "",
      status: "ativo",
      stock_quantity: 0,
      min_stock: 5,
    })
  }

  const getEpiAlerts = (epi: EPI) => {
    const alerts = []
    if (epi.stock_quantity <= epi.min_stock) {
      alerts.push({ type: "stock", message: "Estoque baixo" })
    }
    if (isExpired(epi.ca_validity)) {
      alerts.push({ type: "expired", message: "CA vencido" })
    } else if (isExpiringSoon(epi.ca_validity)) {
      alerts.push({ type: "expiring", message: "CA vencendo" })
    }
    return alerts
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de EPIs</h1>
          <p className="text-gray-600">Gerencie todos os Equipamentos de Proteção Individual</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Novo EPI
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingEpi ? "Editar EPI" : "Novo EPI"}</DialogTitle>
              <DialogDescription>
                {editingEpi ? "Edite as informações do EPI" : "Adicione um novo EPI ao sistema"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nome
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Tipo
                  </Label>
                  <Input
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="ca_number" className="text-right">
                    CA
                  </Label>
                  <Input
                    id="ca_number"
                    value={formData.ca_number}
                    onChange={(e) => setFormData({ ...formData, ca_number: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="manufacturer" className="text-right">
                    Fabricante
                  </Label>
                  <Input
                    id="manufacturer"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="ca_validity" className="text-right">
                    Validade CA
                  </Label>
                  <Input
                    id="ca_validity"
                    type="date"
                    value={formData.ca_validity}
                    onChange={(e) => setFormData({ ...formData, ca_validity: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                      <SelectItem value="vencido">Vencido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stock_quantity" className="text-right">
                    Estoque
                  </Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    min="0"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: Number.parseInt(e.target.value) || 0 })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="min_stock" className="text-right">
                    Estoque Mín.
                  </Label>
                  <Input
                    id="min_stock"
                    type="number"
                    min="0"
                    value={formData.min_stock}
                    onChange={(e) => setFormData({ ...formData, min_stock: Number.parseInt(e.target.value) || 0 })}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{editingEpi ? "Salvar" : "Criar"}</Button>
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
            placeholder="Buscar EPIs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="inativo">Inativo</SelectItem>
            <SelectItem value="vencido">Vencido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de EPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEpis.map((epi) => {
          const alerts = getEpiAlerts(epi)
          return (
            <Card key={epi.id} className="relative">
              {alerts.length > 0 && (
                <div className="absolute top-2 right-2 flex gap-1">
                  {alerts.map((alert, index) => (
                    <div key={index} className="relative group">
                      <AlertTriangle
                        className={`h-4 w-4 ${
                          alert.type === "expired"
                            ? "text-red-500"
                            : alert.type === "expiring"
                              ? "text-yellow-500"
                              : "text-orange-500"
                        }`}
                      />
                      <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {alert.message}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-lg">{epi.name}</CardTitle>
                <CardDescription>{epi.type}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">CA:</span>
                    <span className="font-medium">{epi.ca_number}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Fabricante:</span>
                    <span className="font-medium">{epi.manufacturer}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Validade:</span>
                    <span className="font-medium">{formatDate(epi.ca_validity)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Estoque:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{epi.stock_quantity}</span>
                      {epi.stock_quantity <= epi.min_stock && <Package className="h-4 w-4 text-orange-500" />}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge className={getStatusColor(epi.status)}>
                      {epi.status.charAt(0).toUpperCase() + epi.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(epi)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir o EPI "{epi.name}"? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(epi.id)}>Excluir</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredEpis.length === 0 && (
        <div className="text-center py-12">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum EPI encontrado</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== "all"
              ? "Tente ajustar os filtros de busca"
              : "Comece adicionando um novo EPI ao sistema"}
          </p>
        </div>
      )}
    </div>
  )
}

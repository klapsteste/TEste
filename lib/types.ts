export interface EPI {
  id: string
  name: string
  type: string
  ca_number: string
  manufacturer: string
  ca_validity: string
  status: "ativo" | "inativo" | "vencido"
  stock_quantity: number
  min_stock: number
  created_at: string
  updated_at: string
}

export interface Movement {
  id: string
  epi_id: string
  epi_name: string
  type: "entrega" | "devolucao" | "manutencao" | "descarte"
  quantity: number
  employee_name: string
  employee_registration: string
  user_name: string
  movement_date: string
  observation?: string
}

export interface DashboardData {
  summary: {
    totalEpis: number
    activeEpis: number
    lowStock: number
    expiringSoon: number
    recentMovements: number
  }
  alerts: {
    lowStock: EPI[]
    expiringSoon: EPI[]
  }
}

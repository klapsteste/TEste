import type { EPI, Movement } from "./types"
import { mockEPIs, mockMovements } from "./mockData"

// Simulação de localStorage para persistência
export class LocalStorage {
  static getEPIs(): EPI[] {
    if (typeof window === "undefined") return mockEPIs
    const stored = localStorage.getItem("epis")
    return stored ? JSON.parse(stored) : mockEPIs
  }

  static setEPIs(epis: EPI[]): void {
    if (typeof window === "undefined") return
    localStorage.setItem("epis", JSON.stringify(epis))
  }

  static getMovements(): Movement[] {
    if (typeof window === "undefined") return mockMovements
    const stored = localStorage.getItem("movements")
    return stored ? JSON.parse(stored) : mockMovements
  }

  static setMovements(movements: Movement[]): void {
    if (typeof window === "undefined") return
    localStorage.setItem("movements", JSON.stringify(movements))
  }

  static addEPI(epi: Omit<EPI, "id" | "created_at" | "updated_at">): EPI {
    const epis = this.getEPIs()
    const newEPI: EPI = {
      ...epi,
      id: Date.now().toString(),
      created_at: new Date().toISOString().split("T")[0],
      updated_at: new Date().toISOString().split("T")[0],
    }
    epis.push(newEPI)
    this.setEPIs(epis)
    return newEPI
  }

  static updateEPI(id: string, updates: Partial<EPI>): EPI | null {
    const epis = this.getEPIs()
    const index = epis.findIndex((epi) => epi.id === id)
    if (index === -1) return null

    epis[index] = {
      ...epis[index],
      ...updates,
      updated_at: new Date().toISOString().split("T")[0],
    }
    this.setEPIs(epis)
    return epis[index]
  }

  static deleteEPI(id: string): boolean {
    const epis = this.getEPIs()
    const filtered = epis.filter((epi) => epi.id !== id)
    if (filtered.length === epis.length) return false
    this.setEPIs(filtered)
    return true
  }

  static addMovement(movement: Omit<Movement, "id" | "movement_date" | "epi_name">): Movement {
    const movements = this.getMovements()
    const epis = this.getEPIs()
    const epi = epis.find((e) => e.id === movement.epi_id)

    const newMovement: Movement = {
      ...movement,
      id: Date.now().toString(),
      movement_date: new Date().toISOString().split("T")[0],
      epi_name: epi?.name || "EPI não encontrado",
    }

    movements.unshift(newMovement)
    this.setMovements(movements)

    // Atualizar estoque do EPI
    if (epi) {
      let newQuantity = epi.stock_quantity
      if (movement.type === "entrega" || movement.type === "descarte") {
        newQuantity -= movement.quantity
      } else if (movement.type === "devolucao") {
        newQuantity += movement.quantity
      }
      this.updateEPI(movement.epi_id, { stock_quantity: Math.max(0, newQuantity) })
    }

    return newMovement
  }
}

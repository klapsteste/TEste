import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("pt-BR")
}

export function isExpiringSoon(date: string, days = 30): boolean {
  const expiryDate = new Date(date)
  const today = new Date()
  const diffTime = expiryDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays <= days && diffDays >= 0
}

export function isExpired(date: string): boolean {
  const expiryDate = new Date(date)
  const today = new Date()
  return expiryDate < today
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "ativo":
      return "text-green-600 bg-green-100"
    case "inativo":
      return "text-gray-600 bg-gray-100"
    case "vencido":
      return "text-red-600 bg-red-100"
    default:
      return "text-gray-600 bg-gray-100"
  }
}

export function getMovementTypeColor(type: string): string {
  switch (type) {
    case "entrega":
      return "text-blue-600 bg-blue-100"
    case "devolucao":
      return "text-green-600 bg-green-100"
    case "manutencao":
      return "text-yellow-600 bg-yellow-100"
    case "descarte":
      return "text-red-600 bg-red-100"
    default:
      return "text-gray-600 bg-gray-100"
  }
}

export function exportToCSV(data: any[], filename: string): void {
  if (data.length === 0) return

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header]
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
}

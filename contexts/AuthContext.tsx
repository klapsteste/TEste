"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import toast from "react-hot-toast"

interface User {
  id: number
  name: string
  email: string
  role: "admin" | "gerente" | "operador"
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  }
  return context
}

// Usuários simulados
const mockUsers: User[] = [
  { id: 1, name: "Administrador", email: "admin@empresa.com", role: "admin" },
  { id: 2, name: "Gerente Segurança", email: "gerente@empresa.com", role: "gerente" },
  { id: 3, name: "Operador", email: "operador@empresa.com", role: "operador" },
]

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar se há usuário logado no localStorage
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("epi-user")
      if (savedUser) {
        setUser(JSON.parse(savedUser))
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simular delay de autenticação
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const foundUser = mockUsers.find((u) => u.email === email)

    if (foundUser && password === "123456") {
      setUser(foundUser)
      if (typeof window !== "undefined") {
        localStorage.setItem("epi-user", JSON.stringify(foundUser))
      }
      toast.success("Login realizado com sucesso!")
      return true
    } else {
      toast.error("Credenciais inválidas")
      return false
    }
  }

  const logout = () => {
    setUser(null)
    if (typeof window !== "undefined") {
      localStorage.removeItem("epi-user")
    }
    toast.success("Logout realizado com sucesso!")
  }

  return <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>
}

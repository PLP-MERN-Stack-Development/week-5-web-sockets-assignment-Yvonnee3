
import { createContext, useContext, useState, useEffect } from "react"
import api from "../api"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    if (storedToken) {
      setToken(storedToken)
      verifyToken(storedToken)
    } else {
      setLoading(false)
    }
  }, [])

  const verifyToken = async (token) => {
    try {
      const response = await api.get("/api/auth/verify", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setUser(response.data.user)
      setToken(token)
    } catch (error) {
      console.error("Token verification failed:", error)
      localStorage.removeItem("token")
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await api.post("/api/auth/login", { email, password })
      const { token, user } = response.data

      localStorage.setItem("token", token)
      setToken(token)
      setUser(user)

      return { success: true }
    } catch (error) {
      console.error("Login error:", error)
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      }
    }
  }

  const register = async (username, email, password) => {
    try {
      const response = await api.post("/api/auth/register", {
        username,
        email,
        password,
      })

      const { token, user } = response.data

      localStorage.setItem("token", token)
      setToken(token)
      setUser(user)

      return { success: true }
    } catch (error) {
      console.error("Registration error:", error)
      return {
        success: false,
        error: error.response?.data?.message || "Registration failed",
      }
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    setToken(null)
    setUser(null)
  }

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

import { createContext, useContext, useState } from 'react'
import api from '../api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(() => JSON.parse(localStorage.getItem('user'))  || null)
  const [token, setToken] = useState(() => localStorage.getItem('token') || null)

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password })
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('user',  JSON.stringify(res.data.user))
    setToken(res.data.token)
    setUser(res.data.user)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
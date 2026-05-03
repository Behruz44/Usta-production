import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Categories from './pages/Categories'
import Users from './pages/Users'
import Orders from './pages/Orders'
import { getMe } from './api/auth'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        setCheckingAuth(false)
        return
      }

      try {
        const session = await getMe()
        const sessionUser = session.user || session
        localStorage.setItem('user', JSON.stringify(sessionUser))
        setIsAuthenticated(true)
        setUser(sessionUser)
      } catch (error) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        setIsAuthenticated(false)
        setUser(null)
      } finally {
        setCheckingAuth(false)
      }
    }

    verifySession()
  }, [])

  const handleLogin = (userData, token, refreshToken) => {
    localStorage.setItem('auth_token', token)
    localStorage.setItem('refresh_token', refreshToken)
    localStorage.setItem('user', JSON.stringify(userData))
    setIsAuthenticated(true)
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    setUser(null)
  }

  if (checkingAuth) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', fontFamily: 'Inter, system-ui, sans-serif', color: '#475569' }}>
        Проверка сессии...
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
        <Route path="/" element={isAuthenticated ? <Layout user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="categories" element={<Categories />} />
          <Route path="orders" element={<Orders />} />
          <Route path="users" element={<Users />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}

export default App

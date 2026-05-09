import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Kontrol from './pages/Kontrol'
import Jadwal from './pages/Jadwal'
import Alert from './pages/Alert'
import Login from './pages/Login'
import Register from './pages/Register'
import Settings from './pages/Settings'

function Layout({ children }) {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>

            {/* Public */}
            <Route path="/login"    element={<Login />}    />
            <Route path="/register" element={<Register />} />

            {/* Protected */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout><Dashboard /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/kontrol" element={
              <ProtectedRoute>
                <Layout><Kontrol /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/jadwal" element={
              <ProtectedRoute>
                <Layout><Jadwal /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/alert" element={
              <ProtectedRoute>
                <Layout><Alert /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Layout><Settings /></Layout>
              </ProtectedRoute>
            } />

          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
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
    <>
      <Navbar />
      <main style={{ padding: '24px', maxWidth: 1100, margin: '0 auto' }}>
        {children}
      </main>
    </>
  )
}

function App() {
  return (
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
  )
}

export default App
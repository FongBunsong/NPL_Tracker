import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import Loans from '../pages/Loans'
import Customers from '../pages/Customers'
import Alerts from '../pages/Alerts'
import Reports from '../pages/Reports'
import Analytics from '../pages/Analytics'
import Settings from '../pages/Settings'
import PageContainer from '../components/layout/PageContainer'

function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext)
  const location = useLocation()
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  return children
}

export default function AppRoutes() {
  const { user } = useContext(AuthContext)

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <PageContainer />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="loans" element={<Loans />} />
        <Route path="customers" element={<Customers />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="reports" element={<Reports />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

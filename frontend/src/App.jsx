import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/authStore'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import CitizenDashboard from './pages/citizen/Dashboard'
import OfficerDashboard from './pages/government/OfficerDashboard'
import CollectorDashboard from './pages/government/CollectorDashboard'
import IndustryDashboard from './pages/industry/Dashboard'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user?.role)) return <Navigate to="/login" replace />
  return children
}

const RoleRoute = () => {
  const { user } = useAuthStore()
  switch (user?.role) {
    case 'citizen': return <Navigate to="/citizen" replace />
    case 'government_officer': return <Navigate to="/officer" replace />
    case 'garbage_collector': return <Navigate to="/collector" replace />
    case 'industry': return <Navigate to="/industry" replace />
    default: return <Navigate to="/login" replace />
  }
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<ProtectedRoute><RoleRoute /></ProtectedRoute>} />
        <Route path="/citizen/*" element={<ProtectedRoute allowedRoles={['citizen']}><CitizenDashboard /></ProtectedRoute>} />
        <Route path="/officer/*" element={<ProtectedRoute allowedRoles={['government_officer']}><OfficerDashboard /></ProtectedRoute>} />
        <Route path="/collector/*" element={<ProtectedRoute allowedRoles={['garbage_collector']}><CollectorDashboard /></ProtectedRoute>} />
        <Route path="/industry/*" element={<ProtectedRoute allowedRoles={['industry']}><IndustryDashboard /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

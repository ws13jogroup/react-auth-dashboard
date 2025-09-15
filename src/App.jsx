import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '@/components/ProtectedRoute.jsx'
import Navbar from '@/components/Navbar.jsx'
import Login from '@/pages/Login.jsx'
import ForgotPassword from '@/pages/ForgotPassword.jsx'
import ResetPassword from '@/pages/ResetPassword.jsx'
import Dashboard from '@/pages/Dashboard.jsx'
import NotFound from '@/pages/NotFound.jsx'

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

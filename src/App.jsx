import { Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@mui/material'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import VerificationForm from './pages/VerificationForm'
import ComplianceReports from './pages/ComplianceReports'
import ModelMonitoring from './pages/ModelMonitoring'
import Login from './pages/Login'

function App() {
  return (
    <Box sx={{ display: 'flex' }}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="verification" element={<VerificationForm />} />
          <Route path="reports" element={<ComplianceReports />} />
          <Route path="model-monitoring" element={<ModelMonitoring />} />
        </Route>
      </Routes>
    </Box>
  )
}

export default App
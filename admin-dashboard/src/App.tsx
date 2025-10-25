import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Providers } from './providers'
import { Dashboard } from './pages/Dashboard'
import { Login } from './pages/Login'
import { Users } from './pages/Users'
import { Doctors } from './pages/Doctors'
import { Appointments } from './pages/Appointments'
import { Reports } from './pages/Reports'
import { ImportExport } from './pages/ImportExport'
import { Audit } from './pages/Audit'
import { System } from './pages/System'
import { ProtectedRoute } from './components/ProtectedRoute'

function App() {
  return (
    <Providers>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/users" 
            element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/doctors" 
            element={
              <ProtectedRoute>
                <Doctors />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/appointments" 
            element={
              <ProtectedRoute>
                <Appointments />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/import-export" 
            element={
              <ProtectedRoute>
                <ImportExport />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/audit" 
            element={
              <ProtectedRoute>
                <Audit />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/system" 
            element={
              <ProtectedRoute>
                <System />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </Providers>
  )
}

export default App

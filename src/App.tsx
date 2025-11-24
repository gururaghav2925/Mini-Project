import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'

import Signup from './pages/auth/Signup'
import Login from './pages/auth/Login'
import ForgotPassword from './pages/auth/ForgotPassword'
import Home from './pages/Home'
import Recipes from './pages/Recipes'
import Assistant from './pages/Assistant'
import Profile from './pages/Profile'
import Pantry from './pages/Pantry'
import AuthGuard from './components/AuthGuard' // You created this earlier!

function App() {
  return (
    <Router>
      <Routes>
        {/* --- Public Routes (No Navbar) --- */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* --- Protected Routes (With Navbar) --- */}
        {/* Wrap all private pages in AuthGuard to block unauthenticated users */}
        
        <Route
          path="/"
          element={
            <AuthGuard>
              <MainLayout>
                <Home />
              </MainLayout>
            </AuthGuard>
          }
        />

        <Route
          path="/recipes"
          element={
            <AuthGuard>
              <MainLayout>
                <Recipes />
              </MainLayout>
            </AuthGuard>
          }
        />

        <Route
          path="/assistant"
          element={
            <AuthGuard>
              <MainLayout>
                <Assistant />
              </MainLayout>
            </AuthGuard>
          }
        />

        <Route
          path="/profile"
          element={
            <AuthGuard>
              <MainLayout>
                <Profile />
              </MainLayout>
            </AuthGuard>
          }
        />

        <Route
          path="/pantry"
          element={
            <AuthGuard>
              <MainLayout>
                <Pantry />
              </MainLayout>
            </AuthGuard>
          }
        />

        {/* Fallback: Redirect unknown URLs to Home (which will redirect to Login if needed) */}
        <Route path="*" element={<Navigate to="/" replace />} />
        
      </Routes>
    </Router>
  )
}

export default App
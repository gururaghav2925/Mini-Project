import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import Signup from './pages/auth/Signup'
import Login from './pages/auth/Login'
import ForgotPassword from './pages/auth/ForgotPassword'
import Home from './pages/Home'
import Recipes from './pages/Recipes'
import Assistant from './pages/Assistant'
import Profile from './pages/Profile'
import Pantry from './pages/Pantry'

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth routes without navbar */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Main routes with navbar */}
        <Route
          path="/"
          element={
            <MainLayout>
              <Home />
            </MainLayout>
          }
        />
        <Route
          path="/recipes"
          element={
            <MainLayout>
              <Recipes />
            </MainLayout>
          }
        />
        <Route
          path="/assistant"
          element={
            <MainLayout>
              <Assistant />
            </MainLayout>
          }
        />
        <Route
          path="/profile"
          element={
            <MainLayout>
              <Profile />
            </MainLayout>
          }
        />
        <Route
          path="/pantry"
          element={
            <MainLayout>
              <Pantry />
            </MainLayout>
          }
        />
      </Routes>
    </Router>
  )
}

export default App

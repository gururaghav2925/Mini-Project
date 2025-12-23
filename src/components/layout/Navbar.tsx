import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import {
  Home,
  BookOpen,
  MessageSquare,
  LogOut,
  Menu,
  X,
  ShoppingBasket,
  Activity,
} from 'lucide-react'
import { useState, useEffect } from 'react'

const DEFAULT_AVATAR = "https://via.placeholder.com/150?text=Avatar"

const Navbar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Profile State
  const [profile, setProfile] = useState<{
    full_name?: string
    display_name?: string
    avatar_url?: string | null
    email?: string
  } | null>(null)

  // Fetch Profile Data
  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("full_name, display_name, avatar_url")
          .eq("id", user.id)
          .single()
        
        setProfile({
          email: user.email,
          ...data
        })
      }
    }
    loadProfile()
  }, [])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/recipes', label: 'Recipes', icon: BookOpen },
    { path: '/assistant', label: 'Assistant', icon: MessageSquare },
    { path: '/pantry', label: 'Pantry', icon: ShoppingBasket },
    { path: '/health', label: 'Health', icon: Activity },
    // { path: '/profile', label: 'Profile', icon: User },
  ]

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const displayName = profile?.display_name || profile?.full_name || profile?.email?.split('@')[0] || "Chef"
  const avatarSrc = profile?.avatar_url || DEFAULT_AVATAR

  return (
    <>
      {/* --- MOBILE TOP BAR (Visible only on small screens) --- */}
      <div className="md:hidden bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50 px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-blue-600">Fit-Fork</Link>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* --- DESKTOP HEADER (Profile on Top Right) --- */}
      <div className="hidden md:flex fixed top-0 right-0 left-64 h-24 bg-white border-b border-gray-200 items-center justify-end px-8 z-30">
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-base font-bold text-gray-700">{displayName}</div>
            <div className="text-sm text-gray-500">Free Plan</div>
          </div>
          
          <Link to="/profile" className="relative group cursor-pointer block">
            <div className="w-[75px] h-[75px] rounded-full bg-gray-100 border-2 border-gray-200 overflow-hidden hover:ring-4 hover:ring-blue-100 transition-all shadow-md">
              <img 
                src={avatarSrc} 
                alt="Profile" 
                className="w-full h-full object-cover" 
              />
            </div>
          </Link>
        </div>
      </div>

      {/* --- SIDEBAR (Desktop: Fixed Left) --- */}
      <aside 
        className={`
          fixed top-0 left-0 h-screen bg-white border-r border-gray-200 z-40 
          transition-transform duration-300 ease-in-out flex-shrink-0
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 
          w-64 
          pt-16 md:pt-0 
        `}
      >
        {/* Logo Area (Desktop only - Top Left) */}
        <div className="hidden md:flex items-center h-24 px-6 border-b border-gray-100">
          <Link to="/" className="text-3xl font-bold text-blue-600">Fit-Fork</Link>
        </div>

        {/* Nav Links */}
        <div className="flex flex-col h-[calc(100%-6rem)] justify-between p-4">
          <div className="space-y-1 mt-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative
                    ${active ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
                  `}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors mt-auto w-full"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}

export default Navbar
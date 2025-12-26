import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import {
  Home,
  BookOpen,
  MessageSquare,
  User,
  LogOut,
  Menu,
  X,
  ShoppingBasket,
  Activity,
} from 'lucide-react'
import { useState, useEffect } from 'react'

const DEFAULT_AVATAR = "https://via.placeholder.com/150?text=Avatar"
const LOGO_URL = "/logo.jpg"

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
    { path: '/profile', label: 'Profile', icon: User },
  ]

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)
  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  const displayName = profile?.display_name || profile?.full_name || profile?.email?.split('@')[0] || "Chef"
  const avatarSrc = profile?.avatar_url || DEFAULT_AVATAR

  return (
    <>
      {/* --- MOBILE TOP BAR (Visible only on small screens) --- */}
      <div className="md:hidden bg-[#0F1A30] shadow-sm border-b border-[#1e2a45] fixed top-0 left-0 right-0 z-50 px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          {/* Mobile Logo: Keep manageable size */}
          <img src={LOGO_URL} alt="Logo" className="w-10 h-10 object-contain brightness-0 invert" />
          <span className="text-xl font-bold text-white">Fit-Fork</span>
        </Link>
        <button onClick={toggleMobileMenu} className="p-2 text-white/90 hover:text-white">
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
            <div className="w-[75px] h-[75px] rounded-full bg-gray-100 border-2 border-gray-200 overflow-hidden hover:ring-4 hover:ring-[#0F1A30] transition-all shadow-md">
              <img 
                src={avatarSrc} 
                alt="Profile" 
                className="w-full h-full object-cover" 
              />
            </div>
          </Link>
        </div>
      </div>

      {/* --- DESKTOP SIDEBAR (Left) --- */}
      <nav className="hidden md:flex flex-col w-64 h-screen bg-[#0F1A30] border-r border-[#1e2a45] fixed left-0 top-0 z-40 text-white">
        <div className="flex items-center h-24 px-6 border-b border-white/10">
          <Link to="/" className="flex items-center gap-3">
            {/* Desktop Logo: Increased size here */}
            <img src={LOGO_URL} alt="Logo" className="w-16 h-16 object-contain brightness-100 border-2 border-white rounded-full" />
            { <span className="text-2xl font-bold text-white truncate">Fit-Fork</span>  }
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-3 py-3 rounded-lg transition-colors duration-200
                  ${active ? 'bg-white/10 text-white shadow-lg shadow-black/10' : 'text-indigo-100 hover:bg-white/5 hover:text-white'}
                `}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-white' : 'text-indigo-300 group-hover:text-white'}`} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-3 w-full rounded-lg text-indigo-200 hover:bg-white/5 hover:text-white transition-colors duration-200"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {/* --- MOBILE NAV (Overlay for Mobile Menu) --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm pt-16">
           <div className="px-4 pt-2 pb-3 space-y-1 bg-white border-b border-gray-200 shadow-xl">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.path)
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={closeMobileMenu}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${active ? 'bg-[#0F1A30] text-white font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
              <button onClick={() => { closeMobileMenu(); handleLogout(); }} className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600">
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
        </div>
      )}
    </>
  )
}

export default Navbar
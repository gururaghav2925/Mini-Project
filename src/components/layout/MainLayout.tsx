import { ReactNode } from 'react'
import Navbar from './Navbar'

interface MainLayoutProps {
  children: ReactNode
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Main content area */}
      {/* Mobile: Full width with top padding for mobile navbar (h-16 = 64px) */}
      {/* Desktop: Left margin for sidebar (w-64 = 256px) + top padding for header (h-24 = 96px) */}
      <main className="w-full pt-16 md:pt-24 md:ml-[257px] md:w-[calc(100%-16rem-1px)]">
        {children}
      </main>
    </div>
  )
}

export default MainLayout

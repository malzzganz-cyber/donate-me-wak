'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useRealtimeNotifications } from '@/hooks/useRealtime'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Bell, Wallet, LogOut, ExternalLink,
  Copy, ChevronRight, Settings
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/notifications', icon: Bell, label: 'Notifikasi' },
  { href: '/dashboard/withdraw', icon: Wallet, label: 'Withdraw' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, userProfile, loading, logout } = useAuth()
  const { unreadCount } = useRealtimeNotifications(currentUser?.uid)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/auth')
    }
  }, [currentUser, loading, router])

  if (loading || !currentUser || !userProfile) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/50 font-body text-sm">Memuat dashboard...</p>
        </div>
      </div>
    )
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const copyDonateLink = () => {
    const url = `${window.location.origin}/${userProfile.username}`
    navigator.clipboard.writeText(url)
    toast.success('Link donasi disalin! 🎉')
  }

  return (
    <div className="min-h-screen bg-mesh flex">
      {/* Sidebar */}
      <aside className="w-64 min-h-screen glass-dark border-r border-white/5 flex flex-col fixed left-0 top-0 z-40">
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center neon-purple">
              <span className="font-display font-bold text-white text-sm">M</span>
            </div>
            <div>
              <p className="font-display font-bold text-white text-sm">Malzz Store</p>
              <p className="text-white/30 text-xs font-body">Creator Hub</p>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-white/5">
          <div className="glass rounded-xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
              {userProfile.avatar_url ? (
                <img src={userProfile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <span className="font-display font-bold text-white text-sm">{userProfile.display_name[0]}</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-semibold text-white text-sm truncate">{userProfile.display_name}</p>
              <p className="text-purple-400 text-xs font-body">@{userProfile.username}</p>
            </div>
          </div>

          {/* Donate Link */}
          <button
            onClick={copyDonateLink}
            className="mt-2 w-full glass border border-white/5 hover:border-purple-500/30 rounded-xl px-3 py-2 flex items-center gap-2 transition-all group"
          >
            <span className="text-white/40 text-xs font-mono truncate flex-1 text-left">
              /{userProfile.username}
            </span>
            <Copy size={12} className="text-white/30 group-hover:text-purple-400 transition-colors flex-shrink-0" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative',
                  active
                    ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/10 border border-purple-500/20 text-white'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                )}
              >
                <item.icon size={18} className={active ? 'text-purple-400' : ''} />
                <span className="font-body text-sm font-medium">{item.label}</span>
                {item.href === '/dashboard/notifications' && unreadCount > 0 && (
                  <span className="ml-auto bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
                {active && (
                  <ChevronRight size={14} className="ml-auto text-purple-400" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom actions */}
        <div className="p-4 border-t border-white/5 space-y-2">
          <Link
            href={`/${userProfile.username}`}
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all text-sm font-body"
          >
            <ExternalLink size={16} />
            Lihat halaman donasi
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/50 hover:text-red-400 hover:bg-red-500/5 transition-all text-sm font-body"
          >
            <LogOut size={16} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-8"
        >
          {children}
        </motion.div>
      </main>
    </div>
  )
}

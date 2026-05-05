'use client'

import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useRealtimeNotifications } from '@/hooks/useRealtime'
import { doc, updateDoc, writeBatch, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Bell, BellOff, Check, CheckCheck } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function NotificationsPage() {
  const { currentUser } = useAuth()
  const { notifications, unreadCount, loading } = useRealtimeNotifications(currentUser?.uid)

  const markAsRead = async (id: string) => {
    await updateDoc(doc(db, 'notifications', id), { is_read: true })
  }

  const markAllRead = async () => {
    if (!currentUser) return
    const q = query(
      collection(db, 'notifications'),
      where('uid', '==', currentUser.uid),
      where('is_read', '==', false)
    )
    const snapshot = await getDocs(q)
    const batch = writeBatch(db)
    snapshot.docs.forEach((d) => batch.update(d.ref, { is_read: true }))
    await batch.commit()
    toast.success('Semua notifikasi ditandai terbaca')
  }

  const typeColors: Record<string, string> = {
    donation: 'from-purple-500 to-blue-500',
    admin: 'from-blue-500 to-cyan-500',
    withdraw: 'from-green-500 to-emerald-500',
  }

  const typeIcons: Record<string, string> = {
    donation: '💸',
    admin: '📢',
    withdraw: '💰',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Notifikasi</h1>
          <p className="text-white/50 font-body text-sm mt-1">
            {unreadCount > 0 ? `${unreadCount} belum dibaca` : 'Semua sudah dibaca'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="glass border border-white/10 hover:border-purple-500/30 px-4 py-2 rounded-xl text-white/70 hover:text-white transition-all flex items-center gap-2 text-sm font-body"
          >
            <CheckCheck size={14} />
            Tandai semua terbaca
          </button>
        )}
      </div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl border border-white/5 overflow-hidden"
      >
        {loading ? (
          <div className="divide-y divide-white/5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-5 flex items-start gap-4">
                <div className="skeleton w-10 h-10 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 rounded-lg w-1/3" />
                  <div className="skeleton h-3 rounded-lg w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-16 text-center">
            <BellOff size={40} className="text-white/20 mx-auto mb-4" />
            <p className="text-white/50 font-body">Belum ada notifikasi</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {notifications.map((notif, i) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  'p-5 flex items-start gap-4 transition-colors cursor-pointer',
                  !notif.is_read ? 'bg-purple-500/5 hover:bg-purple-500/8' : 'hover:bg-white/2'
                )}
                onClick={() => !notif.is_read && notif.id && markAsRead(notif.id)}
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${typeColors[notif.type] || 'from-purple-500 to-blue-500'} flex items-center justify-center text-lg flex-shrink-0`}>
                  {typeIcons[notif.type] || '🔔'}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-display font-semibold text-white text-sm">{notif.title}</p>
                    {!notif.is_read && (
                      <span className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-white/60 font-body text-sm leading-relaxed">{notif.message}</p>
                  <p className="text-white/30 text-xs font-body mt-2">{formatRelativeTime(notif.created_at)}</p>
                </div>

                {!notif.is_read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      notif.id && markAsRead(notif.id)
                    }}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-purple-500/20 text-white/30 hover:text-purple-400 transition-all flex-shrink-0"
                    title="Tandai terbaca"
                  >
                    <Check size={12} />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}

'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useOverlayDonations } from '@/hooks/useRealtime'
import { formatCurrency } from '@/lib/utils'
import { Heart } from 'lucide-react'

export default function OverlayPage({ params }: { params: { username: string } }) {
  const { latestDonation, show } = useOverlayDonations(params.username)

  return (
    <div className="min-h-screen overlay-bg bg-transparent flex items-end justify-start p-6">
      <AnimatePresence>
        {show && latestDonation && (
          <motion.div
            key={latestDonation.order_id}
            initial={{ opacity: 0, x: -100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -100, scale: 0.8 }}
            transition={{ type: 'spring', bounce: 0.4, duration: 0.6 }}
            className="relative"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded-2xl blur-xl" />

            <div
              className="relative rounded-2xl p-5 min-w-[320px] max-w-[400px]"
              style={{
                background: 'linear-gradient(135deg, rgba(15,15,20,0.95) 0%, rgba(26,26,36,0.95) 100%)',
                border: '1px solid rgba(139,92,246,0.4)',
                boxShadow: '0 0 40px rgba(139,92,246,0.3), 0 0 80px rgba(59,130,246,0.15)',
                backdropFilter: 'blur(20px)',
              }}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center animate-glow-pulse">
                  <Heart size={18} className="text-white" fill="currentColor" />
                </div>
                <div>
                  <p className="text-xs text-white/50 font-body uppercase tracking-wider">Donasi Masuk!</p>
                  <p className="font-display font-bold text-white text-lg leading-tight">{latestDonation.name}</p>
                </div>
                <div className="ml-auto">
                  <div
                    className="px-3 py-1.5 rounded-xl font-display font-bold text-sm"
                    style={{
                      background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                      boxShadow: '0 4px 15px rgba(139,92,246,0.4)',
                    }}
                  >
                    {formatCurrency(latestDonation.amount)}
                  </div>
                </div>
              </div>

              {/* Message */}
              <div
                className="rounded-xl px-4 py-3"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <p className="text-white/80 font-body text-sm leading-relaxed italic">
                  &ldquo;{latestDonation.message}&rdquo;
                </p>
              </div>

              {/* Progress bar (auto-hide timer) */}
              <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 5, ease: 'linear' }}
                className="mt-3 h-0.5 rounded-full origin-left"
                style={{ background: 'linear-gradient(90deg, #8b5cf6, #3b82f6)' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

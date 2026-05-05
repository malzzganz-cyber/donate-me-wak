'use client'

import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useRealtimeDonations } from '@/hooks/useRealtime'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { TrendingUp, Users, Zap, Award, ArrowUpRight, Copy, ExternalLink } from 'lucide-react'
import { format, subDays, startOfDay } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { toast } from 'sonner'
import type { Donation } from '@/types'

function AnimatedCounter({ value, prefix = '' }: { value: number; prefix?: string }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<number>(0)

  useEffect(() => {
    const start = ref.current
    const end = value
    const duration = 1000
    const startTime = Date.now()

    const tick = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(start + (end - start) * eased))
      if (progress < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
    ref.current = value
  }, [value])

  return <span>{prefix}{display.toLocaleString('id-ID')}</span>
}

export default function DashboardPage() {
  const { currentUser, userProfile } = useAuth()
  const { donations, loading } = useRealtimeDonations(currentUser?.uid, 50)
  const [chartData, setChartData] = useState<any[]>([])
  const [leaderboard, setLeaderboard] = useState<{ name: string; total: number }[]>([])

  const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0)
  const todayAmount = donations
    .filter((d) => d.created_at >= startOfDay(new Date()))
    .reduce((sum, d) => sum + d.amount, 0)

  useEffect(() => {
    // Build 7-day chart data
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i)
      const dayStart = startOfDay(date)
      const dayEnd = new Date(dayStart.getTime() + 86400000)
      const total = donations
        .filter((d) => d.created_at >= dayStart && d.created_at < dayEnd)
        .reduce((sum, d) => sum + d.amount, 0)
      return {
        date: format(date, 'EEE', { locale: localeId }),
        total,
      }
    })
    setChartData(last7)

    // Leaderboard - top donors
    const donorMap: Record<string, number> = {}
    donations.forEach((d) => {
      donorMap[d.name] = (donorMap[d.name] || 0) + d.amount
    })
    const sorted = Object.entries(donorMap)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
    setLeaderboard(sorted)
  }, [donations])

  const stats = [
    {
      label: 'Total Donasi',
      value: totalAmount,
      prefix: 'Rp ',
      icon: TrendingUp,
      color: 'from-purple-500 to-blue-500',
      sub: `${donations.length} transaksi`,
    },
    {
      label: 'Saldo',
      value: userProfile?.balance || 0,
      prefix: 'Rp ',
      icon: Zap,
      color: 'from-blue-500 to-cyan-500',
      sub: 'Siap dicairkan',
    },
    {
      label: 'Hari Ini',
      value: todayAmount,
      prefix: 'Rp ',
      icon: ArrowUpRight,
      color: 'from-pink-500 to-purple-500',
      sub: 'Donasi masuk hari ini',
    },
    {
      label: 'Pendukung',
      value: new Set(donations.map((d) => d.name)).size,
      prefix: '',
      icon: Users,
      color: 'from-cyan-500 to-blue-500',
      sub: 'Donatur unik',
    },
  ]

  const copyOverlayLink = () => {
    const url = `${window.location.origin}/overlay/${userProfile?.username}`
    navigator.clipboard.writeText(url)
    toast.success('Link overlay disalin!')
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">
            Halo, {userProfile?.display_name?.split(' ')[0]} 👋
          </h1>
          <p className="text-white/50 font-body text-sm mt-1">
            Selamat datang di dashboard Malzz Store
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={copyOverlayLink}
            className="glass border border-white/10 hover:border-purple-500/30 px-4 py-2.5 rounded-xl text-white/70 hover:text-white transition-all flex items-center gap-2 text-sm font-body"
          >
            <Copy size={14} />
            Link Overlay
          </button>
          <a
            href={`/${userProfile?.username}`}
            target="_blank"
            className="btn-brand flex items-center gap-2 text-sm py-2.5"
          >
            <ExternalLink size={14} />
            Halaman Donasi
          </a>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-2xl p-6 card-hover border border-white/5"
          >
            <div className="flex items-start justify-between mb-4">
              <p className="text-white/50 font-body text-sm">{stat.label}</p>
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon size={16} className="text-white" />
              </div>
            </div>
            <p className="font-display text-2xl font-bold text-white mb-1">
              {loading ? (
                <span className="skeleton rounded-lg w-24 h-7 block" />
              ) : (
                <AnimatedCounter value={stat.value} prefix={stat.prefix} />
              )}
            </p>
            <p className="text-white/30 text-xs font-body">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Chart + Leaderboard */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass rounded-2xl p-6 border border-white/5"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-lg font-bold text-white">Pemasukan 7 Hari</h2>
            <span className="text-white/30 text-xs font-body bg-white/5 px-3 py-1 rounded-full">Per hari</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 12, fontFamily: 'DM Sans' }} />
              <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11, fontFamily: 'DM Sans' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(26,26,36,0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  fontFamily: 'DM Sans',
                  color: '#fff',
                }}
                formatter={(value: number) => [formatCurrency(value), 'Total']}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#8b5cf6"
                strokeWidth={2}
                fill="url(#colorTotal)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-2xl p-6 border border-white/5"
        >
          <div className="flex items-center gap-2 mb-6">
            <Award size={18} className="text-yellow-400" />
            <h2 className="font-display text-lg font-bold text-white">Top Donatur</h2>
          </div>
          <div className="space-y-3">
            {leaderboard.length === 0 ? (
              <p className="text-white/30 text-sm font-body text-center py-6">
                Belum ada donasi
              </p>
            ) : (
              leaderboard.map((donor, i) => (
                <div key={donor.name} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-display flex-shrink-0 ${
                    i === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                    i === 1 ? 'bg-gray-400/20 text-gray-300' :
                    i === 2 ? 'bg-orange-500/20 text-orange-400' :
                    'bg-white/5 text-white/40'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-body font-medium truncate">{donor.name}</p>
                    <p className="text-white/40 text-xs font-mono">{formatCurrency(donor.total)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Donations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass rounded-2xl border border-white/5"
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-white">Donasi Terbaru</h2>
          <span className="text-white/30 text-xs font-body">{donations.length} total</span>
        </div>
        <div className="divide-y divide-white/5">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 flex items-center gap-4">
                <div className="skeleton w-10 h-10 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 rounded-lg w-1/3" />
                  <div className="skeleton h-3 rounded-lg w-2/3" />
                </div>
                <div className="skeleton h-5 rounded-lg w-20" />
              </div>
            ))
          ) : donations.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-3">💸</div>
              <p className="text-white/50 font-body">Belum ada donasi masuk</p>
              <p className="text-white/30 text-sm font-body mt-1">Bagikan link donasi kamu!</p>
            </div>
          ) : (
            donations.slice(0, 10).map((donation) => (
              <div key={donation.id} className="p-4 flex items-center gap-4 hover:bg-white/2 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0 border border-purple-500/10">
                  <span className="font-display font-bold text-purple-400 text-sm">
                    {donation.name[0]?.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-body font-medium text-sm">{donation.name}</p>
                  <p className="text-white/40 text-xs font-body truncate italic">&ldquo;{donation.message}&rdquo;</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="gradient-text font-display font-bold">{formatCurrency(donation.amount)}</p>
                  <p className="text-white/30 text-xs font-body">{formatRelativeTime(donation.created_at)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  )
}

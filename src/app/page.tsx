'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Zap, Shield, TrendingUp, Users, Star, ChevronRight } from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Realtime Donation',
    desc: 'Donasi langsung tampil di overlay streamer tanpa delay',
    color: 'from-purple-500 to-blue-500',
  },
  {
    icon: Shield,
    title: 'Payment Aman',
    desc: 'Transaksi via QRIS dengan verifikasi otomatis Pakasir',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: TrendingUp,
    title: 'Analytics Premium',
    desc: 'Dashboard lengkap dengan grafik pemasukan real-time',
    color: 'from-pink-500 to-purple-500',
  },
  {
    icon: Users,
    title: 'Multi Creator',
    desc: 'Satu platform untuk ribuan creator konten Indonesia',
    color: 'from-cyan-500 to-blue-500',
  },
]

const stats = [
  { label: 'Creator Aktif', value: '10K+' },
  { label: 'Total Donasi', value: 'Rp 5M+' },
  { label: 'Transaksi/Hari', value: '500+' },
  { label: 'Uptime', value: '99.9%' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-mesh overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm font-display">M</span>
            </div>
            <span className="font-display font-bold text-white text-lg">Malzz Store</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <Link
              href="/auth"
              className="text-white/70 hover:text-white transition-colors font-body text-sm px-4 py-2"
            >
              Masuk
            </Link>
            <Link
              href="/auth"
              className="btn-brand text-sm"
            >
              Mulai Gratis
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative">
        {/* Decorative orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-8 border border-purple-500/20">
              <Star size={14} className="text-purple-400" />
              <span className="text-sm text-white/70 font-body">Platform Donasi #1 Indonesia</span>
            </div>

            <h1 className="font-display text-6xl md:text-7xl font-bold leading-tight mb-6">
              <span className="text-white">Terima Donasi</span>
              <br />
              <span className="gradient-text-animated">Tanpa Batas</span>
            </h1>

            <p className="text-white/60 text-xl font-body mb-10 max-w-2xl mx-auto leading-relaxed">
              Platform donasi multi-creator dengan overlay live, analitik premium, dan pembayaran QRIS instan.
              Fokus bikin konten — kami urus sisanya.
            </p>

            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link href="/auth" className="btn-brand flex items-center gap-2 text-base px-8 py-4">
                Daftar Sekarang
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/malzzstore"
                className="glass border border-white/10 px-8 py-4 rounded-xl text-white/80 hover:text-white transition-all hover:border-purple-500/30 flex items-center gap-2 font-body text-base"
              >
                Lihat Demo
                <ChevronRight size={16} />
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="glass rounded-2xl p-6 card-hover">
                <div className="font-display text-3xl font-bold gradient-text mb-1">{stat.value}</div>
                <div className="text-white/50 text-sm font-body">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl font-bold text-white mb-4">
              Semua yang Kamu Butuhkan
            </h2>
            <p className="text-white/50 text-lg font-body">
              Fitur premium untuk creator serius
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-8 card-hover group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon size={24} className="text-white" />
                </div>
                <h3 className="font-display text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-white/50 font-body leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto glass rounded-3xl p-12 text-center border border-purple-500/20 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 pointer-events-none" />
          <h2 className="font-display text-4xl font-bold text-white mb-4 relative">
            Mulai Terima Donasi Hari Ini
          </h2>
          <p className="text-white/50 font-body text-lg mb-8 relative">
            Gratis tanpa kartu kredit. Setup dalam 2 menit.
          </p>
          <Link href="/auth" className="btn-brand inline-flex items-center gap-2 text-lg px-10 py-4 relative">
            Daftar Gratis
            <ArrowRight size={20} />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500" />
            <span className="font-display font-bold text-white text-sm">Malzz Store</span>
          </div>
          <p className="text-white/30 text-sm font-body">
            © 2024 Malzz Store. Dibuat dengan ❤️ di Indonesia
          </p>
        </div>
      </footer>
    </div>
  )
}

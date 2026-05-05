'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import {
  collection, query, where, orderBy, onSnapshot, addDoc,
  serverTimestamp, limit
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'
import { Wallet, ArrowDownToLine, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { Withdraw } from '@/types'

const BANKS = [
  'BCA', 'BRI', 'BNI', 'Mandiri', 'CIMB Niaga', 'Danamon',
  'Permata', 'OVO', 'GoPay', 'DANA', 'ShopeePay', 'LinkAja'
]

export default function WithdrawPage() {
  const { currentUser, userProfile } = useAuth()
  const [withdraws, setWithdraws] = useState<Withdraw[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    amount: '',
    bank_name: '',
    bank_account: '',
    bank_holder: '',
  })

  useEffect(() => {
    if (!currentUser) return
    const q = query(
      collection(db, 'withdraws'),
      where('uid', '==', currentUser.uid),
      orderBy('created_at', 'desc'),
      limit(20)
    )
    const unsub = onSnapshot(q, (snap) => {
      setWithdraws(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          created_at: d.data().created_at?.toDate() || new Date(),
        })) as Withdraw[]
      )
      setLoading(false)
    })
    return unsub
  }, [currentUser])

  const hasPending = withdraws.some((w) => w.status === 'pending')
  const balance = userProfile?.balance || 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const amount = Number(form.amount)

    if (amount < 10000) { toast.error('Minimum withdraw Rp 10.000'); return }
    if (amount > balance) { toast.error('Saldo tidak mencukupi'); return }
    if (!form.bank_name) { toast.error('Pilih bank/e-wallet'); return }
    if (!form.bank_account) { toast.error('Isi nomor rekening/akun'); return }
    if (!form.bank_holder) { toast.error('Isi nama pemilik rekening'); return }
    if (hasPending) { toast.error('Kamu masih punya withdraw yang diproses'); return }

    setSubmitting(true)
    try {
      await addDoc(collection(db, 'withdraws'), {
        uid: currentUser!.uid,
        amount,
        bank_name: form.bank_name,
        bank_account: form.bank_account,
        bank_holder: form.bank_holder,
        status: 'pending',
        created_at: serverTimestamp(),
      })

      // Notification
      await addDoc(collection(db, 'notifications'), {
        uid: currentUser!.uid,
        type: 'withdraw',
        title: '💰 Permintaan Withdraw Dikirim',
        message: `Withdraw ${formatCurrency(amount)} ke ${form.bank_name} sedang diproses.`,
        is_read: false,
        created_at: serverTimestamp(),
      })

      setForm({ amount: '', bank_name: '', bank_account: '', bank_holder: '' })
      setShowForm(false)
      toast.success('Permintaan withdraw berhasil dikirim!')
    } catch (err: any) {
      toast.error('Gagal: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const statusConfig: Record<string, { icon: any; label: string; class: string }> = {
    pending: { icon: Clock, label: 'Diproses', class: 'badge-pending' },
    approved: { icon: CheckCircle, label: 'Disetujui', class: 'badge-completed' },
    rejected: { icon: XCircle, label: 'Ditolak', class: 'badge-rejected' },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Withdraw</h1>
          <p className="text-white/50 font-body text-sm mt-1">Cairkan saldo donasi kamu</p>
        </div>
      </div>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-8 border border-purple-500/20 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 pointer-events-none" />
        <div className="relative flex items-center justify-between flex-wrap gap-6">
          <div>
            <p className="text-white/50 font-body text-sm mb-2">Saldo Tersedia</p>
            <p className="font-display text-5xl font-bold gradient-text">
              {formatCurrency(balance)}
            </p>
            <p className="text-white/30 text-sm font-body mt-2">
              Minimum withdraw: Rp 10.000
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            disabled={balance < 10000 || hasPending}
            className="btn-brand flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowDownToLine size={18} />
            {hasPending ? 'Ada withdraw pending' : 'Tarik Saldo'}
          </button>
        </div>

        {hasPending && (
          <div className="mt-4 flex items-center gap-2 text-yellow-400 text-sm font-body">
            <AlertCircle size={14} />
            Kamu memiliki permintaan withdraw yang sedang diproses
          </div>
        )}
      </motion.div>

      {/* Withdraw Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass rounded-2xl p-6 border border-white/10">
              <h2 className="font-display text-lg font-bold text-white mb-6">Form Withdraw</h2>
              <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-white/60 text-sm font-body mb-2">Jumlah Withdraw</label>
                  <input
                    type="number"
                    placeholder="Rp 0"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="input-glass"
                    min="10000"
                    max={balance}
                    required
                  />
                  <p className="text-white/30 text-xs font-body mt-1">
                    Maksimal: {formatCurrency(balance)}
                  </p>
                </div>

                <div>
                  <label className="block text-white/60 text-sm font-body mb-2">Bank / E-Wallet</label>
                  <select
                    value={form.bank_name}
                    onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
                    className="input-glass"
                    required
                  >
                    <option value="" style={{ background: '#1a1a24' }}>Pilih bank...</option>
                    {BANKS.map((b) => (
                      <option key={b} value={b} style={{ background: '#1a1a24' }}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white/60 text-sm font-body mb-2">Nomor Rekening / Akun</label>
                  <input
                    type="text"
                    placeholder="08xxxxxxxxxx"
                    value={form.bank_account}
                    onChange={(e) => setForm({ ...form, bank_account: e.target.value })}
                    className="input-glass"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-white/60 text-sm font-body mb-2">Nama Pemilik Rekening</label>
                  <input
                    type="text"
                    placeholder="Sesuai rekening"
                    value={form.bank_holder}
                    onChange={(e) => setForm({ ...form, bank_holder: e.target.value })}
                    className="input-glass"
                    required
                  />
                </div>

                <div className="md:col-span-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 glass border border-white/10 py-3 rounded-xl text-white/70 hover:text-white transition-all font-body"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 btn-brand py-3 disabled:opacity-50"
                  >
                    {submitting ? 'Mengirim...' : 'Kirim Permintaan'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl border border-white/5"
      >
        <div className="p-6 border-b border-white/5">
          <h2 className="font-display text-lg font-bold text-white">Riwayat Withdraw</h2>
        </div>
        <div className="divide-y divide-white/5">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-5 flex items-center gap-4">
                <div className="skeleton w-10 h-10 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 rounded-lg w-1/4" />
                  <div className="skeleton h-3 rounded-lg w-1/3" />
                </div>
                <div className="skeleton h-6 rounded-full w-20" />
              </div>
            ))
          ) : withdraws.length === 0 ? (
            <div className="p-12 text-center">
              <Wallet size={36} className="text-white/20 mx-auto mb-3" />
              <p className="text-white/50 font-body">Belum ada riwayat withdraw</p>
            </div>
          ) : (
            withdraws.map((w) => {
              const cfg = statusConfig[w.status]
              return (
                <div key={w.id} className="p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <cfg.icon size={18} className="text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-body font-medium">
                      {formatCurrency(w.amount)}
                    </p>
                    <p className="text-white/40 text-xs font-body">
                      {w.bank_name} · {w.bank_account} · {formatRelativeTime(w.created_at)}
                    </p>
                    {w.note && (
                      <p className="text-white/30 text-xs font-body italic mt-0.5">Catatan: {w.note}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-body font-medium ${cfg.class}`}>
                    {cfg.label}
                  </span>
                </div>
              )
            })
          )}
        </div>
      </motion.div>
    </div>
  )
}

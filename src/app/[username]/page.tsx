'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Heart, Send, ChevronRight } from 'lucide-react'
import { formatCurrency, generateOrderId, calculateFee } from '@/lib/utils'
import { User, Donation } from '@/types'

const AMOUNTS = [5000, 10000, 20000, 50000, 100000, 200000]

export default function DonatePage({ params }: { params: { username: string } }) {
  const [creator, setCreator] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [amount, setAmount] = useState(10000)
  const [customAmount, setCustomAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchCreator = async () => {
      const q = query(collection(db, 'users'), where('username', '==', params.username))
      const snapshot = await getDocs(q)
      if (!snapshot.empty) {
        setCreator({ uid: snapshot.docs[0].id, ...snapshot.docs[0].data() } as User)
      }
      setLoading(false)
    }
    fetchCreator()
  }, [params.username])

  const finalAmount = customAmount ? Number(customAmount) : amount
  const { fee, total } = calculateFee(finalAmount)

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!creator) return
    if (!name.trim()) { toast.error('Nama tidak boleh kosong!'); return }
    if (!message.trim()) { toast.error('Pesan tidak boleh kosong!'); return }
    if (finalAmount < 1000) { toast.error('Minimum donasi Rp 1.000'); return }

    setSubmitting(true)
    try {
      const orderId = generateOrderId()
      const donationData: Omit<Donation, 'id'> = {
        order_id: orderId,
        uid: creator.uid,
        username: creator.username,
        name: name.trim(),
        message: message.trim(),
        amount: finalAmount,
        fee,
        total,
        status: 'pending',
        created_at: new Date(),
      }

      await addDoc(collection(db, 'donations'), {
        ...donationData,
        created_at: serverTimestamp(),
      })

      const slug = process.env.NEXT_PUBLIC_PAKASIR_SLUG
      const payUrl = `https://app.pakasir.com/pay/${slug}/${total}?order_id=${orderId}&qris_only=1`
      window.location.href = payUrl
    } catch (error: any) {
      toast.error('Gagal membuat donasi: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!creator) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center text-center px-4">
        <div className="glass rounded-3xl p-12">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="font-display text-2xl font-bold text-white mb-2">Creator tidak ditemukan</h1>
          <p className="text-white/50 font-body">Username @{params.username} belum terdaftar</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-mesh py-12 px-4">
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-purple-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-80 h-80 bg-blue-500/8 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-lg mx-auto">
        {/* Creator Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-8 border border-white/10 mb-6 text-center"
        >
          <div className="relative inline-block mb-4">
            {creator.avatar_url ? (
              <img
                src={creator.avatar_url}
                alt={creator.display_name}
                className="w-24 h-24 rounded-2xl object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <span className="font-display text-4xl font-bold text-white">
                  {creator.display_name[0]}
                </span>
              </div>
            )}
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Heart size={14} className="text-white" fill="currentColor" />
            </div>
          </div>

          <h1 className="font-display text-2xl font-bold text-white mb-1">{creator.display_name}</h1>
          <p className="text-purple-400 font-body text-sm mb-3">@{creator.username}</p>
          <p className="text-white/60 font-body text-sm leading-relaxed">{creator.bio}</p>
        </motion.div>

        {/* Donate Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-3xl p-8 border border-white/10"
        >
          <h2 className="font-display text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Heart size={20} className="text-pink-400" fill="currentColor" />
            Kirim Dukungan
          </h2>

          <form onSubmit={handleDonate} className="space-y-5">
            <div>
              <label className="block text-white/60 text-sm font-body mb-2">Nama Kamu</label>
              <input
                type="text"
                placeholder="Anonim (atau nama kamu)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-glass"
                required
              />
            </div>

            <div>
              <label className="block text-white/60 text-sm font-body mb-2">Pesan (Wajib)</label>
              <textarea
                placeholder="Tulis pesan untuk creator..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="input-glass resize-none"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-white/60 text-sm font-body mb-3">Nominal Donasi</label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {AMOUNTS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => { setAmount(a); setCustomAmount('') }}
                    className={`py-2.5 rounded-xl font-body text-sm font-medium transition-all ${
                      amount === a && !customAmount
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/20'
                        : 'glass border border-white/10 text-white/70 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {formatCurrency(a)}
                  </button>
                ))}
              </div>
              <input
                type="number"
                placeholder="Atau nominal lain..."
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="input-glass"
                min="1000"
              />
            </div>

            {/* Fee breakdown */}
            {finalAmount >= 1000 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="glass rounded-xl p-4 space-y-2"
              >
                <div className="flex justify-between text-sm font-body">
                  <span className="text-white/50">Nominal donasi</span>
                  <span className="text-white">{formatCurrency(finalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm font-body">
                  <span className="text-white/50">Platform fee (5%)</span>
                  <span className="text-white">{formatCurrency(fee)}</span>
                </div>
                <div className="h-px bg-white/10" />
                <div className="flex justify-between font-body font-semibold">
                  <span className="text-white">Total bayar</span>
                  <span className="gradient-text text-lg">{formatCurrency(total)}</span>
                </div>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-brand w-full py-4 flex items-center justify-center gap-2 text-base disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Bayar via QRIS
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </form>
        </motion.div>

        <p className="text-center text-white/30 text-xs font-body mt-6">
          Powered by <span className="text-purple-400">Malzz Store</span> · Aman & Terpercaya
        </p>
      </div>
    </div>
  )
}

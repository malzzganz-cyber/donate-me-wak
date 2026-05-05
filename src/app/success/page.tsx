'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams, useRouter } from 'next/navigation'
import { collection, query, where, getDocs, doc, updateDoc, increment, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { toast } from 'sonner'
import { CheckCircle, Home, Heart } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import type { Donation } from '@/types'
import canvasConfetti from 'canvas-confetti'

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id')
  const router = useRouter()
  const [donation, setDonation] = useState<Donation | null>(null)
  const [verifying, setVerifying] = useState(true)
  const [verified, setVerified] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const attemptsRef = useRef(0)

  useEffect(() => {
    if (!orderId) {
      router.push('/')
      return
    }

    const pollStatus = async () => {
      attemptsRef.current += 1
      if (attemptsRef.current > 60) {
        clearInterval(intervalRef.current!)
        setVerifying(false)
        toast.error('Verifikasi timeout. Hubungi admin jika sudah bayar.')
        return
      }

      try {
        // Fetch donation from Firestore
        const q = query(collection(db, 'donations'), where('order_id', '==', orderId))
        const snapshot = await getDocs(q)
        if (snapshot.empty) return

        const donationDoc = snapshot.docs[0]
        const donationData = { id: donationDoc.id, ...donationDoc.data() } as Donation

        if (donationData.status === 'completed') {
          clearInterval(intervalRef.current!)
          setDonation(donationData)
          setVerified(true)
          setVerifying(false)
          triggerConfetti()
          return
        }

        // Check Pakasir
        const res = await fetch(`/api/check-status?order_id=${orderId}&amount=${donationData.total}`)
        const { status } = await res.json()

        if (status === 'completed') {
          clearInterval(intervalRef.current!)

          // Update donation
          await updateDoc(doc(db, 'donations', donationDoc.id), { status: 'completed' })

          // Add to creator balance
          const userQuery = query(collection(db, 'users'), where('uid', '==', donationData.uid))
          const userSnap = await getDocs(userQuery)
          if (!userSnap.empty) {
            await updateDoc(doc(db, 'users', userSnap.docs[0].id), {
              balance: increment(donationData.amount),
            })
          }

          // Create notification
          await addDoc(collection(db, 'notifications'), {
            uid: donationData.uid,
            type: 'donation',
            title: '💸 Donasi Masuk!',
            message: `${donationData.name}: ${donationData.message} (${formatCurrency(donationData.amount)})`,
            is_read: false,
            created_at: serverTimestamp(),
          })

          setDonation({ ...donationData, status: 'completed' })
          setVerified(true)
          setVerifying(false)
          triggerConfetti()
        }
      } catch (error) {
        console.error('Poll error:', error)
      }
    }

    pollStatus()
    intervalRef.current = setInterval(pollStatus, 5000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [orderId, router])

  const triggerConfetti = () => {
    const count = 200
    const defaults = { origin: { y: 0.7 } }

    function fire(particleRatio: number, opts: canvasConfetti.Options) {
      canvasConfetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
        colors: ['#8b5cf6', '#3b82f6', '#ec4899', '#06b6d4', '#ffffff'],
      })
    }

    fire(0.25, { spread: 26, startVelocity: 55 })
    fire(0.2, { spread: 60 })
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 })
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
    fire(0.1, { spread: 120, startVelocity: 45 })
  }

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-gradient-radial from-purple-500/5 via-transparent to-transparent pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="glass rounded-3xl p-10 border border-white/10 text-center">
          {verifying && !verified ? (
            <>
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-6">
                <div className="w-10 h-10 border-3 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
              </div>
              <h1 className="font-display text-2xl font-bold text-white mb-3">Memverifikasi Pembayaran</h1>
              <p className="text-white/50 font-body text-sm">Sedang mengecek status transaksi kamu...</p>
              <div className="mt-6 glass rounded-xl p-4">
                <p className="text-white/30 text-xs font-mono">Order ID: {orderId}</p>
              </div>
            </>
          ) : verified && donation ? (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.6 }}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mx-auto mb-6 animate-glow-pulse"
              >
                <CheckCircle size={48} className="text-green-400" fill="currentColor" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h1 className="font-display text-3xl font-bold text-white mb-2">
                  Terimakasih atas dukungan anda untuk{' '}
                  <span className="gradient-text">Malzz Store</span> ❤️
                </h1>
                <p className="text-white/60 font-body text-sm mb-6">
                  Donasi kamu telah berhasil diterima!
                </p>

                <div className="glass rounded-2xl p-6 mb-6 text-left space-y-3">
                  <div className="flex justify-between text-sm font-body">
                    <span className="text-white/50">Dari</span>
                    <span className="text-white font-medium">{donation.name}</span>
                  </div>
                  <div className="flex justify-between text-sm font-body">
                    <span className="text-white/50">Pesan</span>
                    <span className="text-white font-medium text-right max-w-[200px]">{donation.message}</span>
                  </div>
                  <div className="h-px bg-white/10" />
                  <div className="flex justify-between font-body">
                    <span className="text-white/50">Jumlah</span>
                    <span className="gradient-text font-bold text-xl">{formatCurrency(donation.amount)}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link
                    href={`/${donation.username}`}
                    className="flex-1 glass border border-white/10 py-3 rounded-xl text-white/70 hover:text-white transition-all font-body text-sm flex items-center justify-center gap-2"
                  >
                    <Heart size={14} />
                    Donasi Lagi
                  </Link>
                  <Link
                    href="/"
                    className="flex-1 btn-brand py-3 flex items-center justify-center gap-2 text-sm"
                  >
                    <Home size={14} />
                    Beranda
                  </Link>
                </div>
              </motion.div>
            </>
          ) : (
            <>
              <div className="text-5xl mb-4">⏳</div>
              <h1 className="font-display text-2xl font-bold text-white mb-2">Pembayaran Tertunda</h1>
              <p className="text-white/50 font-body text-sm mb-6">
                Belum ada konfirmasi. Jika sudah bayar, tunggu beberapa saat.
              </p>
              <Link href="/" className="btn-brand inline-flex items-center gap-2">
                <Home size={16} />
                Kembali ke Beranda
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-mesh flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}

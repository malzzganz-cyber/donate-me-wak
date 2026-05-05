'use client'

import { useEffect, useState } from 'react'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  limit,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Donation, Notification } from '@/types'

export function useRealtimeDonations(uid: string | undefined, maxItems = 20) {
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) return

    const q = query(
      collection(db, 'donations'),
      where('uid', '==', uid),
      where('status', '==', 'completed'),
      orderBy('created_at', 'desc'),
      limit(maxItems)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate() || new Date(),
      })) as Donation[]
      setDonations(data)
      setLoading(false)
    })

    return unsubscribe
  }, [uid, maxItems])

  return { donations, loading }
}

export function useRealtimeNotifications(uid: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) return

    const q = query(
      collection(db, 'notifications'),
      where('uid', '==', uid),
      orderBy('created_at', 'desc'),
      limit(50)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate() || new Date(),
      })) as Notification[]
      setNotifications(data)
      setUnreadCount(data.filter((n) => !n.is_read).length)
      setLoading(false)
    })

    return unsubscribe
  }, [uid])

  return { notifications, unreadCount, loading }
}

export function useOverlayDonations(username: string) {
  const [latestDonation, setLatestDonation] = useState<Donation | null>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!username) return

    const q = query(
      collection(db, 'donations'),
      where('username', '==', username),
      where('status', '==', 'completed'),
      orderBy('created_at', 'desc'),
      limit(1)
    )

    let initialized = false

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!initialized) {
        initialized = true
        return
      }
      if (!snapshot.empty) {
        const doc = snapshot.docs[0]
        const donation = {
          id: doc.id,
          ...doc.data(),
          created_at: doc.data().created_at?.toDate() || new Date(),
        } as Donation
        setLatestDonation(donation)
        setShow(true)
        setTimeout(() => setShow(false), 5000)
      }
    })

    return unsubscribe
  }, [username])

  return { latestDonation, show }
}

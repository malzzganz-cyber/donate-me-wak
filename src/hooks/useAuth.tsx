'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import {
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { User } from '@/types'

interface AuthContextType {
  currentUser: FirebaseUser | null
  userProfile: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, username: string, displayName: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null)
  const [userProfile, setUserProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as User)
        }
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    const user = result.user

    const userDoc = await getDoc(doc(db, 'users', user.uid))
    if (!userDoc.exists()) {
      const username = user.email?.split('@')[0]?.replace(/[^a-z0-9]/gi, '').toLowerCase() || `user${Date.now()}`
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        username,
        display_name: user.displayName || 'Creator',
        bio: 'Halo! Dukung saya yuk 🙏',
        balance: 0,
        avatar_url: user.photoURL || '',
        created_at: serverTimestamp(),
      })
    }
  }

  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signUpWithEmail = async (email: string, password: string, username: string, displayName: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    await setDoc(doc(db, 'users', result.user.uid), {
      uid: result.user.uid,
      username: username.toLowerCase(),
      display_name: displayName,
      bio: 'Halo! Dukung saya yuk 🙏',
      balance: 0,
      avatar_url: '',
      created_at: serverTimestamp(),
    })
  }

  const logout = async () => {
    await signOut(auth)
  }

  return (
    <AuthContext.Provider value={{
      currentUser,
      userProfile,
      loading,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

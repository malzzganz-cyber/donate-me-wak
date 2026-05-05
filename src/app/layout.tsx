import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/hooks/useAuth'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'Malzz Store – Platform Donasi Creator Indonesia',
  description: 'Platform donasi terbaik untuk kreator konten Indonesia. Dukung creator favoritmu sekarang!',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'Malzz Store – Platform Donasi Creator',
    description: 'Platform donasi terbaik untuk kreator konten Indonesia.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="bg-mesh min-h-screen antialiased">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'rgba(26, 26, 36, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#f8f9fb',
                backdropFilter: 'blur(20px)',
                borderRadius: '12px',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}

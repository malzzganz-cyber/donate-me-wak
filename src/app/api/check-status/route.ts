import { NextRequest, NextResponse } from 'next/server'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// Initialize Firebase Admin (for server-side)
let adminDb: ReturnType<typeof getFirestore> | null = null

function getAdminDb() {
  if (adminDb) return adminDb
  // For development, use client SDK approach
  return null
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const orderId = searchParams.get('order_id')
  const amount = searchParams.get('amount')

  if (!orderId || !amount) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
  }

  const slug = process.env.PAKASIR_SLUG
  const apiKey = process.env.PAKASIR_API_KEY

  if (!slug || !apiKey) {
    return NextResponse.json({ error: 'Payment gateway not configured' }, { status: 500 })
  }

  try {
    const pakasirUrl = `https://app.pakasir.com/api/transactiondetail?project=${slug}&amount=${amount}&order_id=${orderId}&api_key=${apiKey}`

    const response = await fetch(pakasirUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      return NextResponse.json({ status: 'pending', message: 'Gateway error' })
    }

    const data = await response.json()

    // Pakasir returns status field
    const isPaid = data?.status === 'paid' ||
      data?.status === 'completed' ||
      data?.data?.status === 'paid' ||
      data?.data?.status === 'completed'

    return NextResponse.json({
      status: isPaid ? 'completed' : 'pending',
      raw: data,
    })
  } catch (error: any) {
    console.error('Check status error:', error)
    return NextResponse.json({
      status: 'pending',
      error: error.message,
    })
  }
}

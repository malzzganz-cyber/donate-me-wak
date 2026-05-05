export interface User {
  uid: string
  username: string
  display_name: string
  bio: string
  balance: number
  avatar_url?: string
  created_at: Date
}

export interface Donation {
  id?: string
  order_id: string
  uid: string
  username: string
  name: string
  message: string
  amount: number
  fee: number
  total: number
  status: 'pending' | 'completed' | 'failed'
  created_at: Date
}

export interface Notification {
  id?: string
  uid: string
  type: 'donation' | 'admin' | 'withdraw'
  title: string
  message: string
  is_read: boolean
  created_at: Date
}

export interface Withdraw {
  id?: string
  uid: string
  amount: number
  bank_name?: string
  bank_account?: string
  bank_holder?: string
  status: 'pending' | 'approved' | 'rejected'
  note?: string
  created_at: Date
}

export interface DonationFormData {
  name: string
  message: string
  amount: number
}

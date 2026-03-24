export interface Member {
  id: string
  name: string
  avatar: string
}

export interface Expense {
  id: string
  amount: number
  currency: "CNY" | "USD" | "KRW"
  description: string
  category: string
  paidBy: string
  participants: string[]
  createdAt: Date
}

export interface Room {
  code: string
  name: string
  members: Member[]
  expenses: Expense[]
}

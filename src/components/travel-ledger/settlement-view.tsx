import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Check } from "lucide-react"
import type { Expense, Member } from "@/types"
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"

interface SettlementViewProps {
  expenses: Expense[]
  members: Member[]
}

interface Settlement {
  from: Member
  to: Member
  amount: number
  currency: string
}

const currencySymbols: Record<string, string> = { CNY: "¥", USD: "$", KRW: "₩" }

export function SettlementView({ expenses, members }: SettlementViewProps) {
  const calculateSettlements = () => {
    const currencies = [...new Set(expenses.map((e) => e.currency))]
    const allSettlements: Settlement[] = []

    currencies.forEach((currency) => {
      const currencyExpenses = expenses.filter((e) => e.currency === currency)
      const balances: Record<string, number> = {}
      members.forEach((m) => (balances[m.id] = 0))

      currencyExpenses.forEach((expense) => {
        // 修复：防止除零错误，如果参与者为空则跳过
        if (expense.participants.length === 0) {
          return
        }

        // 修复：使用整数计算避免浮点数精度问题
        const splitAmount = Math.round((expense.amount / expense.participants.length) * 100) / 100
        balances[expense.paidBy] = Math.round((balances[expense.paidBy] + expense.amount) * 100) / 100
        expense.participants.forEach((participantId) => {
          balances[participantId] = Math.round((balances[participantId] - splitAmount) * 100) / 100
        })
      })

      const debtors = Object.entries(balances)
        .filter(([, balance]) => balance < -0.01)
        .map(([id, balance]) => ({ id, amount: Math.abs(balance) }))
        .sort((a, b) => b.amount - a.amount)

      const creditors = Object.entries(balances)
        .filter(([, balance]) => balance > 0.01)
        .map(([id, balance]) => ({ id, amount: balance }))
        .sort((a, b) => b.amount - a.amount)

      let i = 0
      let j = 0
      while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i]
        const creditor = creditors[j]
        const transferAmount = Math.min(debtor.amount, creditor.amount)

        if (transferAmount > 0.01) {
          const fromMember = members.find((m) => m.id === debtor.id)
          const toMember = members.find((m) => m.id === creditor.id)
          if (fromMember && toMember) {
            allSettlements.push({
              from: fromMember,
              to: toMember,
              amount: Math.round(transferAmount * 100) / 100,
              currency,
            })
          }
        }

        debtor.amount -= transferAmount
        creditor.amount -= transferAmount

        if (debtor.amount < 0.01) i++
        if (creditor.amount < 0.01) j++
      }
    })

    return allSettlements
  }

  const settlements = calculateSettlements()

  if (expenses.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 pb-24">
        <Empty>
          <EmptyMedia variant="icon">
            <Check className="w-8 h-8" />
          </EmptyMedia>
          <EmptyTitle>暂无结算</EmptyTitle>
          <EmptyDescription>添加支出后可查看分摊结算</EmptyDescription>
        </Empty>
      </div>
    )
  }

  return (
    <div className="p-4 pb-24 space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">结算方案</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {settlements.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-6 text-accent">
              <Check className="w-5 h-5" />
              <span className="font-medium">账目已平，无需转账</span>
            </div>
          ) : (
            settlements.map((settlement, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white shrink-0"
                    style={{ backgroundColor: settlement.from.avatar }}
                  >
                    {settlement.from.name.charAt(0)}
                  </div>
                  <span className="font-medium text-foreground truncate">{settlement.from.name}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold text-foreground">
                    {currencySymbols[settlement.currency]}
                    {settlement.amount.toLocaleString()}
                  </span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>

                <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                  <span className="font-medium text-foreground truncate">{settlement.to.name}</span>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white shrink-0"
                    style={{ backgroundColor: settlement.to.avatar }}
                  >
                    {settlement.to.name.charAt(0)}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

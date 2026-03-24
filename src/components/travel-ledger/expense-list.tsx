import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Utensils, Car, Home, ShoppingBag, Ticket, MoreHorizontal, Trash2, Pencil } from "lucide-react"
import type { Expense, Member } from "@/types"
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { formatTime, currencySymbols } from "@/lib/utils"
import { AddExpenseSheet } from "./add-expense-sheet"

interface ExpenseListProps {
  expenses: Expense[]
  members: Member[]
  currentUser: Member
  onDeleteExpense: (expenseId: string) => Promise<boolean | undefined>
  onEditExpense: (expense: Expense) => Promise<boolean | undefined>
}

const categoryIcons: Record<string, React.ReactNode> = {
  "餐饮": <Utensils className="w-4 h-4" />,
  "交通": <Car className="w-4 h-4" />,
  "住宿": <Home className="w-4 h-4" />,
  "购物": <ShoppingBag className="w-4 h-4" />,
  "门票": <Ticket className="w-4 h-4" />,
  "其他": <MoreHorizontal className="w-4 h-4" />,
}

const categoryColors: Record<string, string> = {
  "餐饮": "bg-orange-100 text-orange-600",
  "交通": "bg-blue-100 text-blue-600",
  "住宿": "bg-emerald-100 text-emerald-600",
  "购物": "bg-pink-100 text-pink-600",
  "门票": "bg-purple-100 text-purple-600",
  "其他": "bg-gray-100 text-gray-600",
}

export function ExpenseList({ expenses, members, currentUser, onDeleteExpense, onEditExpense }: ExpenseListProps) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  const memberMap = useMemo(() => {
    const map = new Map<string, Member>()
    members.forEach((m) => map.set(m.id, m))
    return map
  }, [members])

  const getMemberName = (memberId: string) => memberMap.get(memberId)?.name || "未知"
  const getMemberAvatar = (memberId: string) => memberMap.get(memberId)?.avatar || "#gray"

  const handleDeleteClick = (expenseId: string) => {
    setExpenseToDelete(expenseId)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (expenseToDelete) {
      await onDeleteExpense(expenseToDelete)
      setExpenseToDelete(null)
    }
  }

  const sortedExpenses = [...expenses].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  if (expenses.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 pb-24">
        <Empty>
          <EmptyMedia variant="icon">
            <Utensils className="w-8 h-8" />
          </EmptyMedia>
          <EmptyTitle>暂无账单</EmptyTitle>
          <EmptyDescription>点击下方按钮记录第一笔支出</EmptyDescription>
        </Empty>
      </div>
    )
  }

  return (
    <div className="p-4 pb-24 space-y-3">
      {sortedExpenses.map((expense) => {
        const isOwner = expense.paidBy === currentUser.id
        const splitAmount = expense.amount / expense.participants.length

        return (
          <Card key={expense.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${categoryColors[expense.category] || categoryColors["其他"]}`}>
                  {categoryIcons[expense.category] || categoryIcons["其他"]}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-medium text-foreground truncate">{expense.description}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: getMemberAvatar(expense.paidBy) }} />
                        <span className="text-sm text-muted-foreground truncate">{getMemberName(expense.paidBy)} 支付</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-lg font-semibold text-foreground">
                        {currencySymbols[expense.currency]}{expense.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        人均 {currencySymbols[expense.currency]}{splitAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <span className="text-xs text-muted-foreground">
                      {expense.participants.length}人分摊 · {formatTime(expense.createdAt)}
                    </span>

                    {isOwner && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-foreground"
                          onClick={() => setEditingExpense(expense)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive"
                          onClick={() => handleDeleteClick(expense.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="确认删除"
        description="删除后无法恢复，确定要删除这笔支出吗？"
        confirmText="删除"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteConfirmOpen(false)
          setExpenseToDelete(null)
        }}
      />

      {editingExpense && (
        <AddExpenseSheet
          open={true}
          onOpenChange={(open) => {
            if (!open) setEditingExpense(null)
          }}
          members={members}
          currentUser={currentUser}
          onAddExpense={onEditExpense}
          editMode={true}
          editExpense={editingExpense}
        />
      )}
    </div>
  )
}

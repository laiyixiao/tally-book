import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Receipt, Calculator, Users, Plus, LogOut, Copy, Check, PieChart as PieChartIcon } from "lucide-react"
import type { Room, Member, Expense } from "@/types"
import { ExpenseList } from "./expense-list"
import { SettlementView } from "./settlement-view"
import { MemberList } from "./member-list"
import { CategoryStats } from "./category-stats"
import { AddExpenseSheet } from "./add-expense-sheet"
import { ExportImageButton } from "./export-image"
import { currencySymbols } from "@/lib/utils"

interface RoomViewProps {
  room: Room
  currentUser: Member
  onLeaveRoom: () => void
  onAddExpense: (expense: Expense) => Promise<boolean | undefined>
  onDeleteExpense: (expenseId: string) => Promise<boolean | undefined>
}

export function RoomView({ room, currentUser, onLeaveRoom, onAddExpense, onDeleteExpense }: RoomViewProps) {
  const [activeTab, setActiveTab] = useState("expenses")
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyRoomCode = async () => {
    await navigator.clipboard.writeText(room.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const totalsByCurrency = room.expenses.reduce((acc, expense) => {
    acc[expense.currency] = (acc[expense.currency] || 0) + expense.amount
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="min-h-svh bg-background flex flex-col">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur border-b">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-foreground truncate">{room.name}</h1>
              <button
                onClick={copyRoomCode}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="font-mono tracking-wider">{room.code}</span>
                {copied ? <Check className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <Button variant="ghost" size="icon" onClick={onLeaveRoom} className="text-muted-foreground hover:text-foreground">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 bg-secondary/50 rounded-xl p-3">
              <p className="text-xs text-muted-foreground mb-0.5">总支出</p>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                {Object.entries(totalsByCurrency).length > 0 ? (
                  Object.entries(totalsByCurrency).map(([currency, total]) => (
                    <span key={currency} className="text-lg font-semibold text-foreground">
                      {currencySymbols[currency]}{total.toLocaleString()}
                    </span>
                  ))
                ) : (
                  <span className="text-lg font-semibold text-muted-foreground">¥0</span>
                )}
              </div>
            </div>
            <div className="bg-secondary/50 rounded-xl p-3 min-w-20">
              <p className="text-xs text-muted-foreground mb-0.5">成员</p>
              <span className="text-lg font-semibold text-foreground">{room.members.length}人</span>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 py-2 border-b">
        <div className="grid grid-cols-4 gap-1">
          <button
            onClick={() => setActiveTab("expenses")}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === "expenses" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span className="hidden sm:inline">账单</span>
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === "stats" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
            }`}
          >
            <PieChartIcon className="w-4 h-4" />
            <span className="hidden sm:inline">统计</span>
          </button>
          <button
            onClick={() => setActiveTab("settlement")}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === "settlement" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span className="hidden sm:inline">结算</span>
          </button>
          <button
            onClick={() => setActiveTab("members")}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === "members" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">成员</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === "expenses" && (
          <ExpenseList
            expenses={room.expenses}
            members={room.members}
            currentUser={currentUser}
            onDeleteExpense={onDeleteExpense}
            onEditExpense={onAddExpense}
          />
        )}
        {activeTab === "stats" && (
          <div className="p-4 pb-24 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">分类统计</h2>
              <ExportImageButton room={room} expenses={room.expenses} members={room.members} />
            </div>
            <CategoryStats expenses={room.expenses} />
          </div>
        )}
        {activeTab === "settlement" && <SettlementView expenses={room.expenses} members={room.members} />}
        {activeTab === "members" && <MemberList members={room.members} currentUser={currentUser} />}
      </div>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
        <Button size="lg" className="h-14 px-8 rounded-full shadow-xl shadow-primary/25 gap-2" onClick={() => setShowAddExpense(true)}>
          <Plus className="w-5 h-5" />
          记一笔
        </Button>
      </div>

      <AddExpenseSheet
        open={showAddExpense}
        onOpenChange={setShowAddExpense}
        members={room.members}
        currentUser={currentUser}
        onAddExpense={onAddExpense}
      />
    </div>
  )
}

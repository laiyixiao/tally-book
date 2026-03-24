import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Utensils, Car, Home, ShoppingBag, Ticket, MoreHorizontal, Check } from "lucide-react"
import type { Member, Expense } from "@/types"

interface AddExpenseSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  members: Member[]
  currentUser: Member
  onAddExpense: (expense: Expense) => Promise<boolean | undefined>
  editMode?: boolean
  editExpense?: Expense
}

const categories = [
  { id: "餐饮", icon: Utensils, color: "bg-orange-100 text-orange-600 border-orange-200" },
  { id: "交通", icon: Car, color: "bg-blue-100 text-blue-600 border-blue-200" },
  { id: "住宿", icon: Home, color: "bg-emerald-100 text-emerald-600 border-emerald-200" },
  { id: "购物", icon: ShoppingBag, color: "bg-pink-100 text-pink-600 border-pink-200" },
  { id: "门票", icon: Ticket, color: "bg-purple-100 text-purple-600 border-purple-200" },
  { id: "其他", icon: MoreHorizontal, color: "bg-gray-100 text-gray-600 border-gray-200" },
]

const currencies = [
  { id: "CNY", symbol: "¥", name: "人民币" },
  { id: "USD", symbol: "$", name: "美元" },
  { id: "KRW", symbol: "₩", name: "韩元" },
]

export function AddExpenseSheet({
  open,
  onOpenChange,
  members,
  currentUser,
  onAddExpense,
  editMode = false,
  editExpense
}: AddExpenseSheetProps) {
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("餐饮")
  const [currency, setCurrency] = useState<"CNY" | "USD" | "KRW">("CNY")
  const [participants, setParticipants] = useState<string[]>(members.map((m) => m.id))
  const [error, setError] = useState("")

  // 编辑模式下初始化表单
  useEffect(() => {
    if (editMode && editExpense && open) {
      setAmount(editExpense.amount.toString())
      setDescription(editExpense.description)
      setCategory(editExpense.category)
      setCurrency(editExpense.currency)
      setParticipants(editExpense.participants)
    }
  }, [editMode, editExpense, open])

  const handleSubmit = async () => {
    const amountNum = parseFloat(amount)
    if (!amountNum || amountNum <= 0) {
      setError("请输入有效金额")
      return
    }
    if (!description.trim()) {
      setError("请输入用途说明")
      return
    }
    if (participants.length === 0) {
      setError("请选择至少一位参与者")
      return
    }

    if (editMode && editExpense) {
      // 编辑模式
      const updatedExpense: Expense = {
        ...editExpense,
        amount: amountNum,
        currency,
        description: description.trim(),
        category,
        participants,
      }
      const success = await onAddExpense(updatedExpense)
      if (success) {
        resetForm()
        onOpenChange(false)
      } else {
        setError("更新失败，请重试")
      }
    } else {
      // 添加模式 - 不传 id，让数据库生成
      const newExpense: Omit<Expense, "id"> & { id?: string } = {
        amount: amountNum,
        currency,
        description: description.trim(),
        category,
        paidBy: currentUser.id,
        participants,
        createdAt: new Date(),
      }

      const success = await onAddExpense(newExpense as Expense)
      if (success) {
        resetForm()
        onOpenChange(false)
      } else {
        setError("添加失败，请重试")
      }
    }
  }

  const resetForm = () => {
    if (editMode) {
      // 编辑模式下重置为原始数据
      if (editExpense) {
        setAmount(editExpense.amount.toString())
        setDescription(editExpense.description)
        setCategory(editExpense.category)
        setCurrency(editExpense.currency)
        setParticipants(editExpense.participants)
      }
    } else {
      // 添加模式重置为空
      setAmount("")
      setDescription("")
      setCategory("餐饮")
      setCurrency("CNY")
      setParticipants(members.map((m) => m.id))
    }
    setError("")
  }

  const toggleParticipant = (memberId: string) => {
    setParticipants((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    )
    setError("")
  }

  const toggleAllParticipants = () => {
    if (participants.length === members.length) {
      setParticipants([])
    } else {
      setParticipants(members.map((m) => m.id))
    }
    setError("")
  }

  const selectedCurrency = currencies.find((c) => c.id === currency)

  return (
    <Sheet open={open} onOpenChange={(isOpen: boolean) => {
      if (!isOpen) resetForm()
      onOpenChange(isOpen)
    }}>
      <SheetContent className="h-[85vh] rounded-t-3xl">
        <SheetHeader className="text-left pb-4">
          <SheetTitle className="text-xl font-bold">{editMode ? "编辑支出" : "记一笔"}</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 overflow-auto pb-24">
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">金额</label>
            <div className="flex-1 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-semibold text-muted-foreground">
                {selectedCurrency?.symbol}
              </span>
              <Input
                type="number"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setAmount(e.target.value)
                  setError("")
                }}
                className="h-14 pl-10 text-2xl font-semibold"
              />
            </div>

            <div className="flex gap-2">
              {currencies.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCurrency(c.id as "CNY" | "USD" | "KRW")}
                  className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                    currency === c.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {c.symbol} {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">用途</label>
            <Input
              placeholder="如：午餐、打车"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setDescription(e.target.value)
                setError("")
              }}
              className="h-12"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">分类</label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon
                const isSelected = category === cat.id
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all border-2 ${
                      isSelected
                        ? `${cat.color} border-current`
                        : "bg-secondary text-secondary-foreground border-transparent hover:bg-secondary/80"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {cat.id}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">参与分摊</label>
              <button onClick={toggleAllParticipants} className="text-sm text-accent hover:underline">
                {participants.length === members.length ? "取消全选" : "全选"}
              </button>
            </div>
            <div className="space-y-2">
              {members.map((member) => {
                const isSelected = participants.includes(member.id)
                return (
                  <button
                    key={member.id}
                    onClick={() => toggleParticipant(member.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                      isSelected
                        ? "bg-accent/10 border-2 border-accent/30"
                        : "bg-secondary border-2 border-transparent"
                    }`}
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium text-white shrink-0"
                      style={{ backgroundColor: member.avatar }}
                    >
                      {member.name.charAt(0)}
                    </div>
                    <span className="flex-1 text-left font-medium text-foreground">
                      {member.name}
                      {member.id === currentUser.id && <span className="text-xs text-muted-foreground ml-1">(我)</span>}
                    </span>
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center ${
                      isSelected ? "bg-accent text-accent-foreground" : "border-2 border-muted"
                    }`}>
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
          <Button className="w-full h-12 text-base font-medium" onClick={handleSubmit}>
            {editMode ? "保存修改" : "确认添加"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

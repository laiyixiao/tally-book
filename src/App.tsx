import { useState, useEffect } from "react"
import { supabase } from "./lib/supabase"
import { WelcomeScreen } from "./components/travel-ledger/welcome-screen"
import { RoomView } from "./components/travel-ledger/room-view"
import { ToastProvider } from "./components/ui/toast"
import type { Member, Expense, Room } from "./types"
import { dbMemberToMember, dbExpenseToExpense } from "./lib/transformers"

// Storage key
const STORAGE_KEY = "travel_ledger_auth"

// 保存登录状态
function saveAuth(roomId: string, roomCode: string, memberId: string, memberName: string) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ roomId, roomCode, memberId, memberName }))
}

function clearAuth() {
  localStorage.removeItem(STORAGE_KEY)
}

function getSavedAuth() {
  const data = localStorage.getItem(STORAGE_KEY)
  if (!data) return null
  try {
    return JSON.parse(data)
  } catch {
    return null
  }
}

function App() {
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null)
  const [currentUser, setCurrentUser] = useState<Member | null>(null)
  const [roomId, setRoomId] = useState<string>("")
  const [loading, setLoading] = useState(true)

  // 页面加载时恢复登录状态
  useEffect(() => {
    const restoreAuth = async () => {
      const saved = getSavedAuth()
      if (!saved) {
        setLoading(false)
        return
      }

      try {
        // 验证房间是否存在
        const { data: roomData } = await supabase
          .from("rooms")
          .select()
          .eq("id", saved.roomId)
          .single()

        if (!roomData) {
          clearAuth()
          setLoading(false)
          return
        }

        // 验证成员是否存在
        const { data: memberData } = await supabase
          .from("members")
          .select()
          .eq("id", saved.memberId)
          .eq("room_id", saved.roomId)
          .single()

        if (!memberData) {
          clearAuth()
          setLoading(false)
          return
        }

        // 加载成员列表
        const { data: members } = await supabase
          .from("members")
          .select()
          .eq("room_id", roomData.id)

        // 加载支出列表
        const { data: expenses } = await supabase
          .from("expenses")
          .select()
          .eq("room_id", roomData.id)
          .order("created_at", { ascending: false })

        // 设置状态
        setRoomId(roomData.id)
        setCurrentRoom({
          code: roomData.code,
          name: roomData.name,
          members: members?.map(dbMemberToMember) || [],
          expenses: expenses?.map(dbExpenseToExpense) || [],
        })

        setCurrentUser(dbMemberToMember(memberData))
      } catch (err) {
        clearAuth()
      }

      setLoading(false)
    }

    restoreAuth()
  }, [])

  // 订阅实时变化
  useEffect(() => {
    if (!currentRoom || !roomId) return

    // 订阅成员变化
    const membersSubscription = supabase
      .channel("members")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "members",
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          const newMember = payload.new as { id: string; name: string }
          setCurrentRoom((prev) =>
            prev
              ? {
                  ...prev,
                  members: [...prev.members, dbMemberToMember(newMember)],
                }
              : null
          )
        }
      )
      .subscribe()

    // 订阅支出变化
    const expensesSubscription = supabase
      .channel("expenses")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "expenses",
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            const newExpense = payload.new as any
            // 检查是否已存在，避免重复添加
            setCurrentRoom((prev) => {
              if (!prev) return null
              const exists = prev.expenses.some(e => e.id === newExpense.id)
              if (exists) return prev
              return {
                ...prev,
                expenses: [dbExpenseToExpense(newExpense), ...prev.expenses],
              }
            })
          } else if (payload.eventType === "DELETE") {
            setCurrentRoom((prev) =>
              prev
                ? {
                    ...prev,
                    expenses: prev.expenses.filter((e) => e.id !== payload.old.id),
                  }
                : null
            )
          } else if (payload.eventType === "UPDATE") {
            // 处理更新事件
            const updatedExpense = payload.new as any
            setCurrentRoom((prev) => {
              if (!prev) return null
              return {
                ...prev,
                expenses: prev.expenses.map(e =>
                  e.id === updatedExpense.id ? dbExpenseToExpense(updatedExpense) : e
                ),
              }
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(membersSubscription)
      supabase.removeChannel(expensesSubscription)
    }
  }, [roomId])

  const handleJoinRoom = async (room: Room, user: Member, dbRoomId?: string) => {
    if (dbRoomId) {
      setRoomId(dbRoomId)
    }
    setCurrentRoom(room)
    setCurrentUser(user)

    // 保存登录状态
    if (dbRoomId && user.id) {
      saveAuth(dbRoomId, room.code, user.id, user.name)
    }
  }

  const handleLeaveRoom = () => {
    clearAuth()
    setRoomId("")
    setCurrentRoom(null)
    setCurrentUser(null)
  }

  const handleAddExpense = async (expense: Expense) => {
    if (!roomId || !currentUser) {
      return false
    }

    try {
      const insertData: any = {
        room_id: roomId,
        payer_id: currentUser.id,
        amount: expense.amount,
        currency: expense.currency,
        description: expense.description,
        category: expense.category,
        participant_ids: expense.participants,
      }

      // 如果是编辑操作（有 id 字段），使用 update
      if (expense.id) {
        // 权限校验：只有支出所有者才能编辑
        const existingExpense = currentRoom?.expenses.find(e => e.id === expense.id)
        if (!existingExpense || existingExpense.paidBy !== currentUser.id) {
          return false
        }

        const { error } = await supabase.from("expenses").update(insertData).eq("id", expense.id)
        if (error) throw error
      } else {
        // 新增操作 - 先插入，然后手动更新 state，实时订阅作为备份
        const { data, error } = await supabase.from("expenses").insert(insertData).select().single()
        if (error) throw error

        // 手动添加到 state，避免依赖实时订阅
        setCurrentRoom((prev) => {
          if (!prev) return null
          return {
            ...prev,
            expenses: [dbExpenseToExpense(data), ...prev.expenses],
          }
        })
      }
      return true
    } catch (err) {
      return false
    }
  }

  const handleDeleteExpense = async (expenseId: string) => {
    if (!roomId || !currentUser) return false

    // 权限校验：只有支出所有者才能删除
    const expense = currentRoom?.expenses.find(e => e.id === expenseId)
    if (!expense || expense.paidBy !== currentUser.id) {
      return false
    }

    const { error } = await supabase.from("expenses").delete().eq("id", expenseId)
    if (error) {
      return false
    }
    return true
  }

  // 加载状态
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">正在加载...</p>
        </div>
      </div>
    )
  }

  if (!currentRoom || !currentUser) {
    return (
      <ToastProvider>
        <WelcomeScreen onJoinRoom={handleJoinRoom} />
      </ToastProvider>
    )
  }

  return (
    <ToastProvider>
      <RoomView
        room={currentRoom}
        currentUser={currentUser}
        onLeaveRoom={handleLeaveRoom}
        onAddExpense={handleAddExpense}
        onDeleteExpense={handleDeleteExpense}
      />
    </ToastProvider>
  )
}

export default App

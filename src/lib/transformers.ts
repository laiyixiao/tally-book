import type { Expense, Member, Room } from "@/types"
import { generateAvatar } from "./utils"

// 数据库 Member 记录转前端 Member 类型
export function dbMemberToMember(dbMember: { id: string; name: string }): Member {
  return {
    id: dbMember.id,
    name: dbMember.name,
    avatar: generateAvatar(dbMember.name),
  }
}

// 数据库 Expense 记录转前端 Expense 类型
export function dbExpenseToExpense(dbExpense: any): Expense {
  return {
    id: dbExpense.id,
    amount: parseFloat(dbExpense.amount),
    currency: dbExpense.currency,
    description: dbExpense.description,
    category: dbExpense.category,
    paidBy: dbExpense.payer_id,
    participants: dbExpense.participant_ids,
    createdAt: new Date(dbExpense.created_at),
  }
}

// 房间数据组装
export async function loadRoomData(supabase: any, roomId: string, roomData: any): Promise<{ room: Room; members: Member[] }> {
  const { data: members } = await supabase
    .from("members")
    .select()
    .eq("room_id", roomId)

  const { data: expenses } = await supabase
    .from("expenses")
    .select("*, members(name)")
    .eq("room_id", roomId)
    .order("created_at", { ascending: false })

  const room: Room = {
    code: roomData.code,
    name: roomData.name,
    members: members?.map(dbMemberToMember) || [],
    expenses: expenses?.map(dbExpenseToExpense) || [],
  }

  return { room, members: members?.map(dbMemberToMember) || [] }
}

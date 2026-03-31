import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Plane, Users, Plus, ArrowRight, Sparkles, Lock } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { generateRoomCode, generatePinCode } from "@/lib/utils"
import { dbMemberToMember, dbExpenseToExpense } from "@/lib/transformers"
import type { Room, Member } from "@/types"

interface WelcomeScreenProps {
  onJoinRoom: (room: Room, user: Member, dbRoomId?: string) => void
}

export function WelcomeScreen({ onJoinRoom }: WelcomeScreenProps) {
  const [mode, setMode] = useState<"select" | "create" | "join">("select")
  const [roomName, setRoomName] = useState("")
  const [userName, setUserName] = useState("")
  const [roomCode, setRoomCode] = useState("")
  const [pinCode, setPinCode] = useState("")
  const [usePin, setUsePin] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleCreateRoom = async () => {
    if (!roomName.trim() || !userName.trim()) {
      setError("请填写完整信息")
      return
    }

    setLoading(true)
    setError("")

    try {
      const code = generateRoomCode()
      // 优先使用用户输入的 PIN 码，如果没有输入则生成随机 PIN 码
      const pin = usePin ? (pinCode.trim() || generatePinCode()) : null

      const { data: roomData, error: roomError } = await supabase
        .from("rooms")
        .insert({ code, name: roomName.trim(), pin_code: pin })
        .select()
        .single()

      if (roomError) throw roomError

      const { data: memberData, error: memberError } = await supabase
        .from("members")
        .insert({ room_id: roomData.id, name: userName.trim() })
        .select()
        .single()

      if (memberError) throw memberError

      const user = dbMemberToMember(memberData)

      const room: Room = {
        code: roomData.code,
        name: roomData.name,
        members: [user],
        expenses: [],
      }

      // 如果有 PIN 码，提示用户保存
      if (pin) {
        alert(`房间创建成功！\n\n房间代码：${room.code}\nPIN 码：${pin}\n\n请记下 PIN 码，加入时需要验证！`)
      }

      onJoinRoom(room, user, roomData.id)
    } catch (err) {
      setError("创建失败，请重试")
    } finally {
      setLoading(false)
    }
  }

  const handleJoinRoom = async () => {
    if (!roomCode.trim() || !userName.trim()) {
      setError("请填写完整信息")
      return
    }

    setLoading(true)
    setError("")

    try {
      const { data: roomData, error: roomError } = await supabase
        .from("rooms")
        .select()
        .eq("code", roomCode.trim().toUpperCase())
        .single()

      if (roomError || !roomData) {
        setError("房间不存在，请检查房间代码")
        setLoading(false)
        return
      }

      // 检查是否有 PIN 码
      if (roomData.pin_code) {
        if (!pinCode.trim()) {
          setError("请输入 PIN 码")
          setLoading(false)
          return
        }
        if (pinCode.trim() !== roomData.pin_code) {
          setError("PIN 码错误，请重试")
          setLoading(false)
          return
        }
      }

      const { data: memberData, error: memberError } = await supabase
        .from("members")
        .insert({ room_id: roomData.id, name: userName.trim() })
        .select()
        .single()

      if (memberError) {
        const { data: existingMember } = await supabase
          .from("members")
          .select()
          .eq("room_id", roomData.id)
          .eq("name", userName.trim())
          .single()

        if (existingMember) {
          const { data: members } = await supabase
            .from("members")
            .select()
            .eq("room_id", roomData.id)

          const { data: expenses } = await supabase
            .from("expenses")
            .select()
            .eq("room_id", roomData.id)
            .order("created_at", { ascending: false })

          const user = dbMemberToMember(existingMember)

          const room: Room = {
            code: roomData.code,
            name: roomData.name,
            members: members?.map(dbMemberToMember) || [],
            expenses: expenses?.map(dbExpenseToExpense) || [],
          }

          onJoinRoom(room, user, roomData.id)
          setLoading(false)
          return
        }

        setError("加入失败，请重试")
        setLoading(false)
        return
      }

      const { data: members } = await supabase
        .from("members")
        .select()
        .eq("room_id", roomData.id)

      const { data: expenses } = await supabase
        .from("expenses")
        .select()
        .eq("room_id", roomData.id)
        .order("created_at", { ascending: false })

      const user = dbMemberToMember(memberData)

      const room: Room = {
        code: roomData.code,
        name: roomData.name,
        members: members?.map(dbMemberToMember) || [],
        expenses: expenses?.map(dbExpenseToExpense) || [],
      }

      onJoinRoom(room, user, roomData.id)
    } catch (err) {
      setError("加入失败，请重试")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-svh bg-background flex flex-col">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative flex-1 flex flex-col justify-center px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary mb-6 shadow-2xl shadow-primary/20">
            <Plane className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            旅行记账本
          </h1>
          <p className="text-muted-foreground">
            多人共享 · AA 分摊 · 实时同步
          </p>
        </div>

        {mode === "select" && (
          <div className="space-y-4 max-w-sm mx-auto w-full">
            <Card
              className="cursor-pointer group hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-primary/20"
              onClick={() => setMode("create")}
            >
              <CardContent className="flex items-center gap-4 p-5">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                  <Plus className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">创建账本</h3>
                  <p className="text-sm text-muted-foreground">开始新的旅行记账</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer group hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-primary/20"
              onClick={() => setMode("join")}
            >
              <CardContent className="flex items-center gap-4 p-5">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                  <Users className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">加入账本</h3>
                  <p className="text-sm text-muted-foreground">输入房间代码加入</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </CardContent>
            </Card>

            <div className="flex items-center gap-2 justify-center pt-4">
              <Sparkles className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">实时同步，无需刷新</p>
            </div>
          </div>
        )}

        {mode === "create" && (
          <div className="space-y-6 max-w-sm mx-auto w-full">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">账本名称</label>
              <Input
                placeholder="如：东京之旅"
                value={roomName}
                onChange={(e) => {
                  setRoomName(e.target.value)
                  setError("")
                }}
                className="h-12 text-base"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">你的昵称</label>
              <Input
                placeholder="输入你的昵称"
                value={userName}
                onChange={(e) => {
                  setUserName(e.target.value)
                  setError("")
                }}
                className="h-12 text-base"
                disabled={loading}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="use-pin"
                checked={usePin}
                onChange={(e) => setUsePin(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                disabled={loading}
              />
              <label htmlFor="use-pin" className="text-sm font-medium text-foreground flex items-center gap-1">
                <Lock className="w-4 h-4" />
                设置 PIN 码保护
              </label>
            </div>

            {usePin && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">PIN 码（4 位数字）</label>
                <Input
                  placeholder="1234"
                  value={pinCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                    setPinCode(value)
                    setError("")
                  }}
                  className="h-12 text-base tracking-widest text-center font-mono"
                  maxLength={4}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  加入房间时需要输入此 PIN 码进行验证
                </p>
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="space-y-3 pt-2">
              <Button
                className="w-full h-12 text-base font-medium"
                onClick={handleCreateRoom}
                disabled={loading}
              >
                {loading ? "创建中..." : "创建账本"}
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setMode("select")
                  setError("")
                  setUsePin(false)
                  setPinCode("")
                }}
                disabled={loading}
              >
                返回
              </Button>
            </div>
          </div>
        )}

        {mode === "join" && (
          <div className="space-y-6 max-w-sm mx-auto w-full">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">房间代码</label>
              <Input
                placeholder="输入 6 位房间代码"
                value={roomCode}
                onChange={(e) => {
                  setRoomCode(e.target.value.toUpperCase())
                  setError("")
                }}
                className="h-12 text-base uppercase tracking-widest text-center font-mono"
                maxLength={6}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">你的昵称</label>
              <Input
                placeholder="输入你的昵称"
                value={userName}
                onChange={(e) => {
                  setUserName(e.target.value)
                  setError("")
                }}
                className="h-12 text-base"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">PIN 码（如有）</label>
              <Input
                placeholder="输入 4 位 PIN 码"
                value={pinCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                  setPinCode(value)
                  setError("")
                }}
                className="h-12 text-base tracking-widest text-center font-mono"
                maxLength={4}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                如果房间设置了 PIN 码，请输入以验证身份
              </p>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="space-y-3 pt-2">
              <Button
                className="w-full h-12 text-base font-medium"
                onClick={handleJoinRoom}
                disabled={loading}
              >
                {loading ? "加入中..." : "加入账本"}
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setMode("select")
                  setError("")
                  setPinCode("")
                }}
                disabled={loading}
              >
                返回
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

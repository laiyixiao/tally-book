import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Crown } from "lucide-react"
import type { Member } from "@/types"

interface MemberListProps {
  members: Member[]
  currentUser: Member
}

export function MemberList({ members, currentUser }: MemberListProps) {
  return (
    <div className="p-4 pb-24 space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Crown className="w-4 h-4" />
            成员列表
            <Badge variant="secondary" className="ml-auto">
              {members.length}人
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {members.map((member, index) => {
            const isCurrentUser = member.id === currentUser.id
            const isCreator = index === 0

            return (
              <div
                key={member.id}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                  isCurrentUser ? "bg-accent/10 border border-accent/20" : "bg-secondary/50"
                }`}
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-base font-semibold text-white shrink-0 shadow-lg"
                  style={{ backgroundColor: member.avatar }}
                >
                  {member.name.charAt(0)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground truncate">{member.name}</p>
                    {isCurrentUser && (
                      <Badge variant="outline" className="text-xs shrink-0">我</Badge>
                    )}
                  </div>
                  {isCreator && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Crown className="w-3 h-3 text-amber-500" />
                      <span className="text-xs text-muted-foreground">创建者</span>
                    </div>
                  )}
                </div>

                <div className="w-2 h-2 rounded-full bg-accent shrink-0" title="在线" />
              </div>
            )
          })}
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            分享房间代码给朋友，让他们加入账本一起记账。新成员加入后会自动显示在列表中。
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

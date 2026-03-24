import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import type { Expense } from "@/types"
import { currencySymbols } from "@/lib/utils"

interface CategoryStatsProps {
  expenses: Expense[]
}

const categoryColors: Record<string, string> = {
  餐饮: "#f97316",
  交通: "#3b82f6",
  住宿: "#10b981",
  购物: "#ec4899",
  门票: "#a855f7",
  其他: "#6b7280",
}

export function CategoryStats({ expenses }: CategoryStatsProps) {
  // 按币种和分类统计
  const statsByCurrency = expenses.reduce((acc, expense) => {
    if (!acc[expense.currency]) {
      acc[expense.currency] = {}
    }
    if (!acc[expense.currency][expense.category]) {
      acc[expense.currency][expense.category] = 0
    }
    acc[expense.currency][expense.category] += expense.amount
    return acc
  }, {} as Record<string, Record<string, number>>)

  if (expenses.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {Object.entries(statsByCurrency).map(([currency, categoryData]) => {
        const data = Object.entries(categoryData).map(([category, amount]) => ({
          name: category,
          value: amount,
          fill: categoryColors[category] || categoryColors["其他"],
        }))

        const total = Object.values(categoryData).reduce((sum, val) => sum + val, 0)

        return (
          <Card key={currency}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                {currency} - 分类统计
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => [`${currencySymbols[currency]}${Number(value).toLocaleString()}`, "金额"]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {data.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.fill }}
                      />
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-foreground">
                        {currencySymbols[currency]}{item.value.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground w-12 text-right">
                        {((item.value / total) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

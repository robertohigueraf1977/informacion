import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
  valueClassName?: string
}

export function StatCard({ title, value, description, icon, trend, className, valueClassName }: StatCardProps) {
  return (
    <Card className={cn("border-accent-soft", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-secondary-soft rounded-t-lg">
        <CardTitle className="text-sm font-medium text-primary">{title}</CardTitle>
        {icon && <div className="text-primary">{icon}</div>}
      </CardHeader>
      <CardContent className="pt-6">
        <div className={cn("text-2xl font-bold", valueClassName)}>{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        {trend && (
          <div
            className={cn(
              "text-xs font-medium mt-2 flex items-center",
              trend.isPositive ? "text-green-600" : "text-red-600",
            )}
          >
            {trend.isPositive ? "↑" : "↓"} {trend.value}%
          </div>
        )}
      </CardContent>
    </Card>
  )
}

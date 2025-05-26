import type React from "react"
import { cn } from "@/lib/utils"

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
}

export function PageHeader({ title, description, className, ...props }: PageHeaderProps) {
  return (
    <div className={cn("space-y-0.5", className)} {...props}>
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
  )
}

"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { FileUp } from "lucide-react"

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  action?: () => void
  icon?: React.ReactNode
}

export function EmptyState({ title, description, actionLabel, action, icon }: EmptyStateProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/5">
        {icon || <FileUp className="h-10 w-10 text-primary/40" />}
      </div>
      <h3 className="mt-4 text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-md">{description}</p>
      {action && (
        <Button onClick={action} className="mt-6">
          {actionLabel || "Comenzar"}
        </Button>
      )}
    </div>
  )
}

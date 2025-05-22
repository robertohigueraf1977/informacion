"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface AnimatedCounterProps {
  from: number
  to: number
  duration?: number
  className?: string
  formatValue?: (value: number) => string
}

export function AnimatedCounter({
  from,
  to,
  duration = 1000,
  className,
  formatValue = (value) => value.toString(),
}: AnimatedCounterProps) {
  const [count, setCount] = useState(from)
  const countRef = useRef(from)
  const startTimeRef = useRef<number | null>(null)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    // Reset animation when 'to' changes
    countRef.current = from
    startTimeRef.current = null

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp
      }

      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)

      // Easing function for smoother animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)

      const currentCount = from + (to - from) * easeOutQuart
      countRef.current = currentCount
      setCount(currentCount)

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      }
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [from, to, duration])

  return <span className={cn(className)}>{formatValue(Math.round(count))}</span>
}

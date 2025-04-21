"use client"

import { useEffect, useRef } from "react"
import { animate } from "framer-motion"

interface AnimatedCounterProps {
  from: number
  to: number
  duration?: number
  formatValue?: (value: number) => string
  className?: string
}

export function AnimatedCounter({
  from,
  to,
  duration = 1,
  formatValue = (value) => value.toLocaleString(),
  className,
}: AnimatedCounterProps) {
  const nodeRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const node = nodeRef.current

    if (node) {
      const controls = animate(from, to, {
        duration,
        onUpdate(value) {
          node.textContent = formatValue(Math.floor(value))
        },
      })

      return () => controls.stop()
    }
  }, [from, to, duration, formatValue])

  return <span ref={nodeRef} className={className} />
}

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { UserRound, Home, Landmark, Vote, BarChart3, Settings, LogOut } from "lucide-react"

export default function DashboardNav() {
  const pathname = usePathname()

  const navItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <Home className="h-5 w-5" />,
    },
    {
      href: "/usuarios",
      label: "Usuarios",
      icon: <UserRound className="h-5 w-5" />,
    },
    {
      href: "/casillas",
      label: "Casillas",
      icon: <Landmark className="h-5 w-5" />,
    },
    {
      href: "/votos",
      label: "Votos",
      icon: <Vote className="h-5 w-5" />,
    },
    {
      href: "/metasresultados",
      label: "Metas y Resultados",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      href: "/configuracion",
      label: "Configuración",
      icon: <Settings className="h-5 w-5" />,
    },
  ]

  return (
    <div className="w-64 border-r border-accent-soft bg-secondary-soft p-4">
      <div className="flex flex-col h-full">
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground",
                pathname.includes(item.href) ? "bg-primary text-primary-foreground" : "text-muted-foreground",
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </div>
        <div className="mt-auto pt-4 border-t border-accent-soft">
          <Link
            href="#"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all"
          >
            <LogOut className="h-5 w-5" />
            Cerrar Sesión
          </Link>
        </div>
      </div>
    </div>
  )
}

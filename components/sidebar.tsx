"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  BarChart2,
  CheckSquare,
  Home,
  Map,
  MapPin,
  Users,
  Building,
  FileText,
  Vote,
  FileBarChart,
  Flag,
  Globe,
  CircleUser,
  LogOut,
  Menu,
  X,
} from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

// Define routes for the sidebar
const routes = [
  {
    label: "Dashboard",
    icon: BarChart2,
    href: "/dashboard",
  },
  {
    label: "Tareas",
    icon: CheckSquare,
    href: "/tareas",
  },
  {
    label: "Personas",
    icon: Users,
    href: "/personas",
  },
  {
    label: "Domicilios",
    icon: Home,
    href: "/domicilios",
  },
  {
    label: "Municipios",
    icon: Building,
    href: "/municipios",
  },
  {
    label: "Distritos",
    icon: Map,
    href: "/distritos",
  },
  {
    label: "Secciones",
    icon: MapPin,
    href: "/secciones",
  },
  {
    label: "Sectores",
    icon: FileText,
    href: "/sectores",
  },
  {
    label: "Casillas",
    icon: Vote,
    href: "/casillas",
  },
  {
    label: "Partidos",
    icon: Flag,
    href: "/partidos",
  },
  {
    label: "Votos",
    icon: FileBarChart,
    href: "/votos",
  },
  {
    label: "Metas y Resultados",
    icon: FileBarChart,
    href: "/metasresultados",
  },
  {
    label: "Mapa Electoral",
    icon: Globe,
    href: "/mapa",
  },
]

export function Sidebar({ className }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsOpen(false)
      } else {
        setIsOpen(true)
      }
    }

    // Set initial state
    handleResize()

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed left-4 top-4 z-50 md:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Menu Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r bg-background transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          className,
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between border-b bg-primary px-4">
          <Link href="/" className="flex items-center gap-2 text-primary-foreground">
            <BarChart2 className="h-6 w-6" />
            <span className="font-bold text-xl">Sistema Electoral</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="hidden text-primary-foreground/80 hover:text-primary-foreground md:flex"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Sidebar Content */}
        <ScrollArea className="flex-1 overflow-auto">
          <div className="space-y-4 py-4">
            <div className="px-4 py-2">
              <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight text-muted-foreground">Navegación</h2>
              <div className="space-y-1">
                {routes.map((route) => (
                  <NavItem
                    key={route.href}
                    href={route.href}
                    icon={<route.icon className="h-4 w-4" />}
                    label={route.label}
                    active={pathname === route.href}
                  />
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Sidebar Footer */}
        <div className="border-t p-4">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <CircleUser className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 truncate">
              <div className="text-sm font-medium">Admin</div>
              <div className="truncate text-xs text-muted-foreground">admin@sistema.mx</div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" title="Cerrar sesión">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Toggle button (shown when sidebar is collapsed) */}
      {!isOpen && (
        <Button
          variant="secondary"
          size="icon"
          className="fixed left-4 top-4 z-30 hidden md:flex"
          onClick={() => setIsOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}
    </>
  )
}

interface NavItemProps {
  href: string
  icon: React.ReactNode
  label: string
  active?: boolean
}

function NavItem({ href, icon, label, active = false }: NavItemProps) {
  const pathname = usePathname()
  const isActive = active || pathname === href

  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors hover:bg-primary/10",
        isActive ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground",
      )}
    >
      <div className="mr-2">{icon}</div>
      <span>{label}</span>
      {isActive && (
        <motion.div
          layoutId="sidebar-indicator"
          className="absolute left-0 h-full w-1 rounded-r-md bg-primary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </Link>
  )
}

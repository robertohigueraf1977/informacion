"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { UserNav } from "@/components/user-nav"
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
  Sun,
  Moon,
  UserCog,
  FileBarChart,
  Flag,
  Globe,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useSession } from "next-auth/react"
import { UserRole } from "@prisma/client"

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

// Ruta solo para super usuarios
const adminRoutes = [
  {
    label: "Usuarios",
    icon: UserCog,
    href: "/usuarios",
    role: UserRole.SUPER_USER,
  },
]

// Asegurar que el enlace a usuarios solo se muestre para SUPER_USER
export function Sidebar() {
  const pathname = usePathname()
  const { setTheme, theme } = useTheme()
  const { data: session, status } = useSession()
  const userRole = session?.user?.role as UserRole | undefined

  // Mostrar un estado de carga mientras se verifica la sesión
  if (status === "loading") {
    return (
      <div className="flex h-screen flex-col border-r bg-background p-6">
        <div className="animate-pulse">
          <div className="h-6 w-32 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-4 w-full bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col border-r bg-background">
      <div className="p-6">
        <h2 className="text-xl font-bold">Sistema Electoral</h2>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-4 text-sm font-medium">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                pathname === route.href && "bg-muted text-primary",
              )}
            >
              <route.icon className="h-4 w-4" />
              {route.label}
            </Link>
          ))}

          {/* Mostrar rutas de administración solo para super usuarios */}
          {userRole === UserRole.SUPER_USER && (
            <>
              <div className="my-2 px-3 text-xs font-semibold text-muted-foreground">Administración</div>
              {adminRoutes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                    pathname === route.href && "bg-muted text-primary",
                  )}
                >
                  <route.icon className="h-4 w-4" />
                  {route.label}
                </Link>
              ))}
            </>
          )}
        </nav>
      </div>
      <div className="mt-auto p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Admin</p>
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
        <div className="mt-2">
          <UserNav />
        </div>
      </div>
    </div>
  )
}

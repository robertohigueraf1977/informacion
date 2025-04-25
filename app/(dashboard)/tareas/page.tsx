"use client"

import { useSession } from "next-auth/react"
import { UserRole } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { TareasTable } from "@/components/tareas/tareas-table"

export default function TareasPage() {
  const { data: session } = useSession()
  const router = useRouter()

  // Verificar si el usuario puede crear tareas
  const canCreateTareas =
    session?.user?.role === UserRole.SUPER_USER ||
    session?.user?.role === UserRole.ADMIN ||
    session?.user?.role === UserRole.EDITOR

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Tareas</h1>
          <p className="text-muted-foreground">Gestiona las tareas del sistema</p>
        </div>
        {canCreateTareas && (
          <Button onClick={() => router.push("/tareas/crear")}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Tarea
          </Button>
        )}
      </div>

      <TareasTable tareas={[]} />
    </div>
  )
}

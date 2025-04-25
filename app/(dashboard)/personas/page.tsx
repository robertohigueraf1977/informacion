"use client"

import { useSession } from "next-auth/react"
import { UserRole } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { PersonasTable } from "@/components/personas/personas-table"

export default function PersonasPage() {
  const { data: session } = useSession()
  const router = useRouter()

  // Verificar si el usuario puede crear personas
  const canCreatePersonas =
    session?.user?.role === UserRole.SUPER_USER ||
    session?.user?.role === UserRole.ADMIN ||
    session?.user?.role === UserRole.EDITOR

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Personas</h1>
          <p className="text-muted-foreground">Gestiona el padrón de personas</p>
        </div>
        {canCreatePersonas && (
          <Button onClick={() => router.push("/personas/crear")}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Persona
          </Button>
        )}
      </div>

      <PersonasTable personas={[]} />
    </div>
  )
}

import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { UserRole } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { TareasTable } from "@/components/tareas/tareas-table"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"

export default async function TareasPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  // Verificar si el usuario puede crear tareas
  const canCreateTareas =
    session.user.role === UserRole.SUPER_USER ||
    session.user.role === UserRole.ADMIN ||
    session.user.role === UserRole.EDITOR

  // Obtener tareas según el rol del usuario
  let tareas = []

  try {
    // SUPER_USER y ADMIN pueden ver todas las tareas
    if (session.user.role === UserRole.SUPER_USER || session.user.role === UserRole.ADMIN) {
      tareas = await db.tarea.findMany({
        include: {
          persona: true,
          creador: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    }
    // EDITOR y USER solo pueden ver tareas de su municipio
    else {
      // Obtener el usuario con su municipio
      const user = await db.user.findUnique({
        where: { id: session.user.id },
        include: { municipio: true },
      })

      if (user?.municipioId) {
        tareas = await db.tarea.findMany({
          where: {
            OR: [
              {
                persona: {
                  domicilio: {
                    municipioId: user.municipioId,
                  },
                },
              },
              {
                creadorId: session.user.id,
              },
            ],
          },
          include: {
            persona: true,
            creador: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        })
      } else {
        // Si el usuario no tiene municipio asignado, solo mostrar sus propias tareas
        tareas = await db.tarea.findMany({
          where: {
            creadorId: session.user.id,
          },
          include: {
            persona: true,
            creador: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        })
      }
    }
  } catch (error) {
    console.error("Error al cargar tareas:", error)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Tareas</h1>
          <p className="text-muted-foreground">Gestiona las tareas del sistema</p>
        </div>
        {canCreateTareas && (
          <Button asChild>
            <Link href="/tareas/crear">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Tarea
            </Link>
          </Button>
        )}
      </div>

      <TareasTable tareas={tareas} />
    </div>
  )
}

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { redirect, notFound } from "next/navigation"
import { db } from "@/lib/db"
import { TareaForm } from "@/components/tareas/tarea-form"
import { EliminarTareaButton } from "@/components/tareas/eliminar-tarea-button"

// Modificar la función para manejar correctamente los parámetros asíncronos
export default async function EditarTareaPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/login")
  }

  // Esperar a que los parámetros estén disponibles
  const resolvedParams = await params
  const id = Number.parseInt(resolvedParams.id, 10)

  if (isNaN(id)) {
    notFound()
  }

  const tarea = await db.tarea.findUnique({
    where: { id },
    select: {
      id: true,
      titulo: true,
      descripcion: true,
      fecha: true,
      completada: true,
      creadorId: true,
      personaId: true,
    },
  })

  if (!tarea) {
    notFound()
  }

  // Obtener personas para el formulario
  const personas = await db.persona.findMany({
    select: {
      id: true,
      nombre: true,
      apellidoPaterno: true,
      apellidoMaterno: true,
    },
    orderBy: [
      {
        apellidoPaterno: "asc",
      },
      {
        apellidoMaterno: "asc",
      },
      {
        nombre: "asc",
      },
    ],
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Editar Tarea</h1>
          <p className="text-muted-foreground">Modifica los datos de la tarea</p>
        </div>
        <EliminarTareaButton id={tarea.id} titulo={tarea.titulo} />
      </div>

      <TareaForm tarea={tarea} personas={personas} />
    </div>
  )
}

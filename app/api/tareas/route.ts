import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    // Verificar si el usuario está autenticado
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const tareas = await db.tarea.findMany({
      select: {
        id: true,
        titulo: true,
        descripcion: true,
        completada: true,
        creador: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        persona: {
          select: {
            id: true,
            nombre: true,
            apellidoPaterno: true,
            apellidoMaterno: true,
          },
        },
      },
      orderBy: [
        {
          completada: "asc",
        },
      ],
    })

    return NextResponse.json(tareas)
  } catch (error) {
    console.error("Error al obtener tareas:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar si el usuario está autenticado
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await req.json()
    const { titulo, descripcion, fecha, completada, personaId } = body

    if (!titulo) {
      return NextResponse.json({ error: "El título es requerido" }, { status: 400 })
    }

    if (!personaId) {
      return NextResponse.json({ error: "La persona es requerida" }, { status: 400 })
    }

    // Crear la tarea asignando al usuario actual como asignadoPor
    const tarea = await db.tarea.create({
      data: {
        titulo,
        descripcion: descripcion || null,
        completada: completada || false,
        fecha: fecha || new Date(), // Add the required 'fecha' field
        creadorId: session.user.id, // El usuario actual asigna la tarea
        personaId: personaId ? Number(personaId) : null,
      },
    })

    return NextResponse.json(tarea, { status: 201 })
  } catch (error) {
    console.error("Error al crear tarea:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

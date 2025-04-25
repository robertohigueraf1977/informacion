import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"

// Modificar la función GET para filtrar por distrito/municipio del usuario
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    // Verificar si el usuario está autenticado
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Obtener el usuario con su información de distrito y municipio
    const usuario = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        municipio: true,
        distritoLocal: true,
        distritoFederal: true,
      },
    })

    let whereClause = {}

    // Si el usuario no es admin, filtrar por su distrito/municipio
    if (session.user.role !== "ADMIN") {
      // Obtener las personas que pertenecen a secciones del municipio/distrito del usuario
      const secciones = await db.seccion.findMany({
        where: {
          OR: [
            { municipioId: usuario?.municipio?.id },
            { distritoLocalId: usuario?.distritoLocal?.id },
            { distritoFederalId: usuario?.distritoFederal?.id },
          ],
        },
        select: { id: true },
      })

      const seccionIds = secciones.map((s) => s.id)

      const personas = await db.persona.findMany({
        where: {
          seccionId: {
            in: seccionIds.length > 0 ? seccionIds : [-1], // Si no hay secciones, usar un ID que no existe
          },
        },
        select: { id: true },
      })

      const personaIds = personas.map((p) => p.id)

      whereClause = {
        personaId: {
          in: personaIds.length > 0 ? personaIds : [-1], // Si no hay personas, usar un ID que no existe
        },
      }
    }

    const tareas = await db.tarea.findMany({
      where: whereClause,
      select: {
        id: true,
        titulo: true,
        descripcion: true,
        completada: true,
        fecha: true,
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

// Modificar la función POST para verificar permisos
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar si el usuario está autenticado
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Verificar si el usuario tiene permisos para crear tareas (solo admin y editor)
    if (session.user.role !== "ADMIN" && session.user.role !== "EDITOR") {
      return NextResponse.json({ error: "No tienes permisos para crear tareas" }, { status: 403 })
    }

    const body = await req.json()
    const { titulo, descripcion, completada, fecha, personaId } = body

    if (!titulo) {
      return NextResponse.json({ error: "El título es requerido" }, { status: 400 })
    }

    if (!personaId) {
      return NextResponse.json({ error: "La persona es requerida" }, { status: 400 })
    }

    // Si el usuario no es admin, verificar que la persona pertenezca a su distrito/municipio
    if (session.user.role !== "ADMIN") {
      const usuario = await db.user.findUnique({
        where: { id: session.user.id },
        include: {
          municipio: true,
          distritoLocal: true,
          distritoFederal: true,
        },
      })

      const persona = await db.persona.findUnique({
        where: { id: Number(personaId) },
        include: { seccion: true },
      })

      if (
        !persona ||
        !persona.seccion ||
        (persona.seccion.municipioId !== usuario?.municipio?.id &&
          persona.seccion.distritoLocalId !== usuario?.distritoLocal?.id &&
          persona.seccion.distritoFederalId !== usuario?.distritoFederal?.id)
      ) {
        return NextResponse.json({ error: "No tienes permisos para asignar tareas a esta persona" }, { status: 403 })
      }
    }

    // Crear la tarea asignando al usuario actual como asignadoPor
    const tarea = await db.tarea.create({
      data: {
        titulo,
        descripcion: descripcion || null,
        completada: completada || false,
        fecha: fecha || new Date(),
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

import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { UserRole } from "@prisma/client"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    let tareas = []

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

    return NextResponse.json(tareas)
  } catch (error) {
    console.error("Error al obtener tareas:", error)
    return NextResponse.json({ error: "Error al obtener tareas" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar si el usuario puede crear tareas
    if (
      session.user.role !== UserRole.SUPER_USER &&
      session.user.role !== UserRole.ADMIN &&
      session.user.role !== UserRole.EDITOR
    ) {
      return NextResponse.json({ error: "No tiene permisos para crear tareas" }, { status: 403 })
    }

    const data = await request.json()
    console.log("Datos recibidos:", data)
    console.log("Rol del usuario:", session.user.role)

    // Validar datos
    if (!data.titulo) {
      return NextResponse.json({ error: "El título es requerido" }, { status: 400 })
    }

    if (!data.personaId) {
      return NextResponse.json({ error: "La persona es requerida" }, { status: 400 })
    }

    // Si es EDITOR, verificar que la persona pertenezca a su municipio
    if (session.user.role === UserRole.EDITOR) {
      // Obtener el usuario con su municipio
      const user = await db.user.findUnique({
        where: { id: session.user.id },
        include: { municipio: true },
      })

      if (!user?.municipioId) {
        return NextResponse.json({ error: "Usuario sin municipio asignado" }, { status: 400 })
      }

      // Verificar que la persona pertenezca al municipio del usuario
      const persona = await db.persona.findUnique({
        where: { id: Number(data.personaId) },
        include: { domicilio: true },
      })

      if (!persona) {
        return NextResponse.json({ error: "Persona no encontrada" }, { status: 404 })
      }

      if (persona.domicilio?.municipioId !== user.municipioId) {
        return NextResponse.json(
          { error: "No puedes crear tareas para personas fuera de tu municipio" },
          { status: 403 },
        )
      }
    }

    // SUPER_USER y ADMIN pueden crear tareas para cualquier persona
    // Crear tarea
    const tareaData: any = {
      titulo: data.titulo,
      descripcion: data.descripcion || null,
      completada: data.completada || false,
      creadorId: session.user.id,
      personaId: Number(data.personaId),
    };

    if (data.fecha) {
      tareaData.fecha = new Date(data.fecha);
    }

    const tarea = await db.tarea.create({
      data: tareaData,
    })

    return NextResponse.json(tarea)
  } catch (error) {
    console.error("Error al crear tarea:", error)
    return NextResponse.json({ error: "Error al crear tarea" }, { status: 500 })
  }
}

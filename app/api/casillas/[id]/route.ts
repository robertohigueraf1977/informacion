import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar si el usuario está autenticado
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const id = Number.parseInt(params.id)

    const casilla = await db.casilla.findUnique({
      where: { id },
      include: {
        seccion: {
          select: {
            nombre: true,
            municipio: {
              select: {
                nombre: true,
              },
            },
          },
        },
        votos: true,
      },
    })

    if (!casilla) {
      return NextResponse.json({ error: "Casilla no encontrada" }, { status: 404 })
    }

    return NextResponse.json(casilla)
  } catch (error) {
    console.error("Error al obtener casilla:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar si el usuario está autenticado
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const id = Number.parseInt(params.id)
    const body = await req.json()
    const { seccionId } = body

    if (!seccionId) {
      return NextResponse.json({ error: "La sección es requerida" }, { status: 400 })
    }

    // Verificar si la casilla existe
    const existingCasilla = await db.casilla.findUnique({
      where: { id },
    })

    if (!existingCasilla) {
      return NextResponse.json({ error: "Casilla no encontrada" }, { status: 404 })
    }

    // Verificar si ya existe otra casilla con la misma sección
    const duplicateCasilla = await db.casilla.findFirst({
      where: {
        seccionId: Number(seccionId),
        NOT: {
          id,
        },
      },
    })

    if (duplicateCasilla) {
      return NextResponse.json({ error: "Ya existe una casilla para esta sección" }, { status: 400 })
    }

    // Actualizar la casilla
    const casilla = await db.casilla.update({
      where: { id },
      data: {
        numero: String(seccionId),
        seccionId: Number(seccionId),
      },
    })

    return NextResponse.json(casilla)
  } catch (error) {
    console.error("Error al actualizar casilla:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar si el usuario está autenticado
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const id = Number.parseInt(params.id)

    // Verificar si la casilla existe
    const existingCasilla = await db.casilla.findUnique({
      where: { id },
      include: {
        votos: true,
      },
    })

    if (!existingCasilla) {
      return NextResponse.json({ error: "Casilla no encontrada" }, { status: 404 })
    }

    // Verificar si tiene votos asociados
    if (existingCasilla.votos.length > 0) {
      return NextResponse.json(
        {
          error: "No se puede eliminar la casilla porque tiene votos asociados. Elimine primero los votos.",
        },
        { status: 400 },
      )
    }

    // Eliminar la casilla
    await db.casilla.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar casilla:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}


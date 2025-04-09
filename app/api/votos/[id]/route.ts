import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar si el usuario está autenticado
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const id = Number.parseInt(params.id)

    const voto = await db.voto.findUnique({
      where: { id },
      include: {
        casilla: {
          select: {
            numero: true,
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
          },
        },
        partido: true,
      },
    })

    if (!voto) {
      return NextResponse.json({ error: "Voto no encontrado" }, { status: 404 })
    }

    return NextResponse.json(voto)
  } catch (error) {
    console.error("Error al obtener voto:", error)
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
    const { casillaId, partidoId, cantidad } = body

    if (!casillaId || !cantidad) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    if (!partidoId) {
      return NextResponse.json({ error: "Debe seleccionar un partido" }, { status: 400 })
    }

    // Verificar si el voto existe
    const existingVoto = await db.voto.findUnique({
      where: { id },
    })

    if (!existingVoto) {
      return NextResponse.json({ error: "Voto no encontrado" }, { status: 404 })
    }

    // Verificar si ya existe otro voto para la misma casilla y partido
    const duplicateVoto = await db.voto.findFirst({
      where: {
        casillaId: Number(casillaId),
        partidoId: Number(partidoId),
        NOT: {
          id,
        },
      },
    })

    if (duplicateVoto) {
      return NextResponse.json(
        { error: "Ya existe un registro de votos para esta combinación de casilla y partido" },
        { status: 400 },
      )
    }

    // Actualizar el voto
    const voto = await db.voto.update({
      where: { id },
      data: {
        casillaId: Number(casillaId),
        partidoId: Number(partidoId),
        cantidad: Number(cantidad),
      },
    })

    return NextResponse.json(voto)
  } catch (error) {
    console.error("Error al actualizar voto:", error)
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

    // Verificar si el voto existe
    const existingVoto = await db.voto.findUnique({
      where: { id },
    })

    if (!existingVoto) {
      return NextResponse.json({ error: "Voto no encontrado" }, { status: 404 })
    }

    // Eliminar el voto
    await db.voto.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar voto:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}


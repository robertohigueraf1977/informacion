import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    // Verificar si el usuario está autenticado
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const votos = await db.voto.findMany({
      include: {
        casilla: {
          include: {
            seccion: {
              include: {
                municipio: true,
              },
            },
          },
        },
        partido: true,
      },
      orderBy: [
        {
          casilla: {
            numero: "asc",
          },
        },
      ],
    })

    return NextResponse.json(votos)
  } catch (error) {
    console.error("Error al obtener votos:", error)
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
    const { casillaId, partidoId, cantidad } = body

    if (!casillaId || !cantidad) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    if (!partidoId) {
      return NextResponse.json({ error: "Debe seleccionar un partido" }, { status: 400 })
    }

    // Verificar si ya existe un voto para la misma casilla y partido
    const existingVoto = await db.voto.findFirst({
      where: {
        casillaId: Number(casillaId),
        partidoId: Number(partidoId),
      },
    })

    if (existingVoto) {
      return NextResponse.json(
        { error: "Ya existe un registro de votos para esta combinación de casilla y partido" },
        { status: 400 },
      )
    }

    // Crear el voto
    const voto = await db.voto.create({
      data: {
        casillaId: Number(casillaId),
        partidoId: Number(partidoId),
        cantidad: Number(cantidad),
      },
    })

    return NextResponse.json(voto, { status: 201 })
  } catch (error) {
    console.error("Error al crear voto:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}


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

    const casillas = await db.casilla.findMany({
      select: {
        id: true,
        numero: true,
        seccion: {
          select: {
            id: true,
            nombre: true,
            municipio: {
              select: {
                nombre: true,
              },
            },
          },
        },
        votos: {
          select: {
            id: true,
          },
        },
      },
      orderBy: [
        {
          seccion: {
            nombre: "asc",
          },
        },
      ],
    })

    return NextResponse.json(casillas)
  } catch (error) {
    console.error("Error al obtener casillas:", error)
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
    const { seccionId } = body

    if (!seccionId) {
      return NextResponse.json({ error: "La sección es requerida" }, { status: 400 })
    }

    // Verificar si la sección existe
    const seccion = await db.seccion.findUnique({
      where: { id: Number(seccionId) },
    })

    if (!seccion) {
      return NextResponse.json({ error: "La sección no existe" }, { status: 400 })
    }

    // Verificar si ya existe una casilla para esta sección
    const existingCasilla = await db.casilla.findFirst({
      where: {
        seccionId: Number(seccionId),
      },
    })

    if (existingCasilla) {
      return NextResponse.json({ error: "Ya existe una casilla para esta sección" }, { status: 400 })
    }

    // Crear la casilla
    const casilla = await db.casilla.create({
      data: {
        numero: String(seccionId),
        tipo: "BASICA", // Valor por defecto para mantener compatibilidad
        seccionId: Number(seccionId),
      },
    })

    return NextResponse.json(casilla, { status: 201 })
  } catch (error) {
    console.error("Error al crear casilla:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}


import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { UserRole } from "@prisma/client"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    // Verificar si el usuario está autenticado
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    let votos = []

    // SUPER_USER y ADMIN pueden ver todos los votos
    if (session.user.role === UserRole.SUPER_USER || session.user.role === UserRole.ADMIN) {
      votos = await db.voto.findMany({
        include: {
          casilla: {
            include: {
              seccion: {
                include: {
                  municipio: true,
                  distritoLocal: true,
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
    } else {
      // EDITOR y USER solo pueden ver votos de su distrito local y municipio
      const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: {
          distritoLocalId: true,
          municipioId: true,
        },
      })

      if (!user?.distritoLocalId || !user?.municipioId) {
        return NextResponse.json({ error: "Usuario sin distrito local o municipio asignado" }, { status: 403 })
      }

      votos = await db.voto.findMany({
        where: {
          casilla: {
            seccion: {
              AND: [{ distritoLocalId: user.distritoLocalId }, { municipioId: user.municipioId }],
            },
          },
        },
        include: {
          casilla: {
            include: {
              seccion: {
                include: {
                  municipio: true,
                  distritoLocal: true,
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
    }

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

    // Verificar si la casilla existe y obtener información de la sección
    const casilla = await db.casilla.findUnique({
      where: { id: Number(casillaId) },
      include: {
        seccion: {
          include: {
            municipio: true,
            distritoLocal: true,
          },
        },
      },
    })

    if (!casilla) {
      return NextResponse.json({ error: "La casilla no existe" }, { status: 400 })
    }

    // Verificar permisos para EDITOR y USER
    if (session.user.role !== UserRole.SUPER_USER && session.user.role !== UserRole.ADMIN) {
      const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: {
          distritoLocalId: true,
          municipioId: true,
        },
      })

      if (!user?.distritoLocalId || !user?.municipioId) {
        return NextResponse.json({ error: "Usuario sin distrito local o municipio asignado" }, { status: 403 })
      }

      if (
        casilla.seccion?.distritoLocalId !== user.distritoLocalId ||
        casilla.seccion?.municipioId !== user.municipioId
      ) {
        return NextResponse.json(
          { error: "No puedes registrar votos en casillas fuera de tu distrito local y municipio" },
          { status: 403 },
        )
      }
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

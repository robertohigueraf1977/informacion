import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { UserRole } from "@/lib/types"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    let secciones = []

    // SUPER_USER y ADMIN pueden ver todas las secciones
    if (session.user.role === UserRole.SUPER_USER || session.user.role === UserRole.ADMIN) {
      secciones = await db.seccion.findMany({
        include: {
          municipio: {
            select: {
              nombre: true,
            },
          },
          distritoLocal: {
            select: {
              nombre: true,
            },
          },
          distritoFederal: {
            select: {
              nombre: true,
            },
          },
        },
        orderBy: {
          nombre: "asc",
        },
      })
    }
    // EDITOR y USER solo pueden ver secciones de su distrito local y municipio
    else {
      const user = await db.user.findUnique({
        where: { id: session.user.id },
        include: {
          distritoLocal: true,
          municipio: true,
        },
      })

      if (!user?.distritoLocalId || !user?.municipioId) {
        return NextResponse.json({ error: "Usuario sin distrito local o municipio asignado" }, { status: 400 })
      }

      secciones = await db.seccion.findMany({
        where: {
          AND: [{ distritoLocalId: user.distritoLocalId }, { municipioId: user.municipioId }],
        },
        include: {
          municipio: {
            select: {
              nombre: true,
            },
          },
          distritoLocal: {
            select: {
              nombre: true,
            },
          },
          distritoFederal: {
            select: {
              nombre: true,
            },
          },
        },
        orderBy: {
          nombre: "asc",
        },
      })
    }

    return NextResponse.json(secciones)
  } catch (error) {
    console.error("Error al obtener secciones:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

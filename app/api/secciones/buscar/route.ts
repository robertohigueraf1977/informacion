import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { UserRole } from "@/lib/types"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query || query.length < 2) {
      return NextResponse.json([])
    }

    let secciones = []

    // SUPER_USER y ADMIN pueden buscar en todas las secciones
    if (session.user.role === UserRole.SUPER_USER || session.user.role === UserRole.ADMIN) {
      secciones = await db.seccion.findMany({
        where: {
          OR: [
            { nombre: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          nombre: true,
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
        },
        take: 10,
      })
    }
    // EDITOR y USER solo pueden buscar en secciones de su distrito local y municipio
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
          AND: [
            { distritoLocalId: user.distritoLocalId },
            { municipioId: user.municipioId },
            {
              OR: [
                { nombre: { contains: query, mode: "insensitive" } },
              ],
            },
          ],
        },
        select: {
          id: true,
          nombre: true,
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
        },
        take: 10,
      })
    }

    return NextResponse.json(secciones)
  } catch (error) {
    console.error("Error al buscar secciones:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

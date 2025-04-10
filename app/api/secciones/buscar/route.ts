import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar si el usuario está autenticado
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Obtener parámetros de búsqueda
    const url = new URL(req.url)
    const search = url.searchParams.get("search") || ""
    const municipioId = url.searchParams.get("municipioId") ? Number(url.searchParams.get("municipioId")) : undefined
    const distritoLocalId = url.searchParams.get("distritoLocalId")
      ? Number(url.searchParams.get("distritoLocalId"))
      : undefined
    const distritoFederalId = url.searchParams.get("distritoFederalId")
      ? Number(url.searchParams.get("distritoFederalId"))
      : undefined

    // Construir la consulta con filtros opcionales
    const whereClause: any = {}

    if (search) {
      whereClause.nombre = {
        contains: search,
      }
    }

    if (municipioId) {
      whereClause.municipioId = municipioId
    }

    if (distritoLocalId) {
      whereClause.distritoLocalId = distritoLocalId
    }

    if (distritoFederalId) {
      whereClause.distritoFederalId = distritoFederalId
    }

    // Buscar secciones con los filtros aplicados
    const secciones = await db.seccion.findMany({
      where: whereClause,
      select: {
        id: true,
        nombre: true,
        municipio: {
          select: {
            id: true,
            nombre: true,
          },
        },
        distritoLocal: {
          select: {
            id: true,
            nombre: true,
          },
        },
        distritoFederal: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
      orderBy: {
        nombre: "asc",
      },
      take: 50, // Limitar resultados para mejor rendimiento
    })

    return NextResponse.json(secciones)
  } catch (error) {
    console.error("Error al buscar secciones:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

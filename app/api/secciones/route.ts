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

    let whereClause = {}

    // Si el usuario no es admin, filtrar por su distrito/municipio
    if (session.user.role !== "ADMIN") {
      // Obtener el usuario con su información de distrito y municipio
      const usuario = await db.user.findUnique({
        where: { id: session.user.id },
        include: {
          municipio: true,
          distritoLocal: true,
          distritoFederal: true,
        },
      })

      whereClause = {
        OR: [
          { municipioId: usuario?.municipio?.id },
          { distritoLocalId: usuario?.distritoLocal?.id },
          { distritoFederalId: usuario?.distritoFederal?.id },
        ],
      }
    }

    const secciones = await db.seccion.findMany({
      where: whereClause,
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

    return NextResponse.json(secciones)
  } catch (error) {
    console.error("Error al obtener secciones:", error)
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
    const { nombre, municipioId, distritoLocalId, distritoFederalId } = body

    if (!nombre || !municipioId) {
      return NextResponse.json({ error: "El nombre y el municipio son requeridos" }, { status: 400 })
    }

    // Verificar si la sección ya existe en el mismo municipio
    const existingSeccion = await db.seccion.findFirst({
      where: {
        nombre,
        municipioId: Number(municipioId),
      },
    })

    if (existingSeccion) {
      return NextResponse.json(
        { error: "Ya existe una sección con ese nombre en el municipio seleccionado" },
        { status: 400 },
      )
    }

    // Crear la sección
    const data: any = {
      nombre,
      municipioId: Number(municipioId),
    }
    if (distritoLocalId !== undefined && distritoLocalId !== null && distritoLocalId !== "") {
      data.distritoLocalId = Number(distritoLocalId)
    }
    if (distritoFederalId !== undefined && distritoFederalId !== null && distritoFederalId !== "") {
      data.distritoFederalId = Number(distritoFederalId)
    }
    const seccion = await db.seccion.create({
      data,
    })

    return NextResponse.json(seccion, { status: 201 })
  } catch (error) {
    console.error("Error al crear sección:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

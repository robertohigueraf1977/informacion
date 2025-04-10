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

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID de sección inválido" }, { status: 400 })
    }

    // Obtener información detallada de la sección
    const seccion = await db.seccion.findUnique({
      where: { id },
      include: {
        municipio: true,
        distritoLocal: true,
        distritoFederal: true,
        // Incluir el conteo de personas
        _count: {
          select: {
            personas: true,
          },
        },
      },
    })

    if (!seccion) {
      return NextResponse.json({ error: "Sección no encontrada" }, { status: 404 })
    }

    return NextResponse.json(seccion)
  } catch (error) {
    console.error("Error al obtener información de la sección:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

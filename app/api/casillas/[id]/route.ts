import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { UserRole } from "@prisma/client"

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
          include: {
            municipio: true,
            distritoLocal: true,
          },
        },
        votos: true,
      },
    })

    if (!casilla) {
      return NextResponse.json({ error: "Casilla no encontrada" }, { status: 404 })
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
        return NextResponse.json({ error: "No tienes permisos para ver esta casilla" }, { status: 403 })
      }
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
      include: {
        seccion: {
          include: {
            municipio: true,
            distritoLocal: true,
          },
        },
      },
    })

    if (!existingCasilla) {
      return NextResponse.json({ error: "Casilla no encontrada" }, { status: 404 })
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
        existingCasilla.seccion?.distritoLocalId !== user.distritoLocalId ||
        existingCasilla.seccion?.municipioId !== user.municipioId
      ) {
        return NextResponse.json({ error: "No tienes permisos para editar esta casilla" }, { status: 403 })
      }
    }

    // Verificar la nueva sección
    const nuevaSeccion = await db.seccion.findUnique({
      where: { id: Number(seccionId) },
      include: {
        municipio: true,
        distritoLocal: true,
      },
    })

    if (!nuevaSeccion) {
      return NextResponse.json({ error: "La nueva sección no existe" }, { status: 400 })
    }

    // Verificar permisos para la nueva sección
    if (session.user.role !== UserRole.SUPER_USER && session.user.role !== UserRole.ADMIN) {
      const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: {
          distritoLocalId: true,
          municipioId: true,
        },
      })

      if (nuevaSeccion.distritoLocalId !== user?.distritoLocalId || nuevaSeccion.municipioId !== user?.municipioId) {
        return NextResponse.json(
          { error: "No puedes asignar casillas a secciones fuera de tu distrito local y municipio" },
          { status: 403 },
        )
      }
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
        seccion: {
          include: {
            municipio: true,
            distritoLocal: true,
          },
        },
      },
    })

    if (!existingCasilla) {
      return NextResponse.json({ error: "Casilla no encontrada" }, { status: 404 })
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
        existingCasilla.seccion?.distritoLocalId !== user.distritoLocalId ||
        existingCasilla.seccion?.municipioId !== user.municipioId
      ) {
        return NextResponse.json({ error: "No tienes permisos para eliminar esta casilla" }, { status: 403 })
      }
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

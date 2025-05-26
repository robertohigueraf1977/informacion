import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { UserRole } from "@/lib/types"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar si el usuario está autenticado
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const id = Number.parseInt(params.id)

    const persona = await db.persona.findUnique({
      where: { id },
      include: {
        domicilio: true,
        seccion: {
          select: {
            nombre: true,
            distritoLocalId: true,
            municipioId: true,
          },
        },
        sector: {
          select: {
            nombre: true,
          },
        },
      },
    })

    if (!persona) {
      return NextResponse.json({ error: "Persona no encontrada" }, { status: 404 })
    }

    // Verificar permisos: EDITOR y USER solo pueden ver personas de su distrito local y municipio
    if (session.user.role !== UserRole.SUPER_USER && session.user.role !== UserRole.ADMIN) {
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

      if (
        persona.seccion?.distritoLocalId !== user.distritoLocalId ||
        persona.seccion?.municipioId !== user.municipioId
      ) {
        return NextResponse.json({ error: "No tienes permisos para ver esta persona" }, { status: 403 })
      }
    }

    return NextResponse.json(persona)
  } catch (error) {
    console.error("Error al obtener persona:", error)
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

    // Verificar si la persona existe
    const existingPersona = await db.persona.findUnique({
      where: { id },
      include: {
        domicilio: true,
        seccion: true,
      },
    })

    if (!existingPersona) {
      return NextResponse.json({ error: "Persona no encontrada" }, { status: 404 })
    }

    // Verificar permisos: EDITOR y USER solo pueden editar personas de su distrito local y municipio
    if (session.user.role !== UserRole.SUPER_USER && session.user.role !== UserRole.ADMIN) {
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

      if (
        existingPersona.seccion?.distritoLocalId !== user.distritoLocalId ||
        existingPersona.seccion?.municipioId !== user.municipioId
      ) {
        return NextResponse.json({ error: "No tienes permisos para editar esta persona" }, { status: 403 })
      }

      // Verificar que la nueva sección (si se cambia) también pertenece al distrito y municipio del usuario
      if (body.seccionId && body.seccionId !== existingPersona.seccionId) {
        const nuevaSeccion = await db.seccion.findUnique({
          where: { id: Number(body.seccionId) },
        })

        if (
          !nuevaSeccion ||
          nuevaSeccion.distritoLocalId !== user.distritoLocalId ||
          nuevaSeccion.municipioId !== user.municipioId
        ) {
          return NextResponse.json(
            { error: "No puedes asignar una sección fuera de tu distrito local y municipio" },
            { status: 403 },
          )
        }
      }
    }

    const {
      nombre,
      apellidoPaterno,
      apellidoMaterno,
      fechaNacimiento,
      curp,
      claveElector,
      seccionId,
      telefono,
      email,
      sectorId,
      referente,
      referidoPorId,
      // Domicilio
      calle,
      numero,
      colonia,
      localidad,
      codigoPostal,
      referencias,
      latitud,
      longitud,
    } = body

    if (!nombre || !apellidoPaterno || !calle) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    // Actualizar la persona y su domicilio en una transacción
    const persona = await db.$transaction(async (tx) => {
      // Actualizar la persona
      const persona = await tx.persona.update({
        where: { id },
        data: {
          nombre,
          apellidoPaterno,
          apellidoMaterno: apellidoMaterno || null,
          fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
          curp: curp || null,
          claveElector: claveElector || null,
          seccionId: seccionId || null,
          telefono: telefono || null,
          email: email || null,
          sectorId: sectorId || null,
          referente: referente || false,
          referidoPorId: referidoPorId || null,
        },
      })

      // Actualizar el domicilio si existe, o crearlo si no existe
      if (existingPersona.domicilio) {
        await tx.domicilio.update({
          where: { id: existingPersona.domicilio.id },
          data: {
            calle,
            numero: numero || null,
            colonia: colonia || null,
            localidad: localidad || null,
            codigoPostal: codigoPostal || null,
            referencias: referencias || null,
            latitud: latitud || null,
            longitud: longitud || null,
            seccionId: seccionId || null,
          },
        })
      } else {
        await tx.domicilio.create({
          data: {
            calle,
            numero: numero || null,
            colonia: colonia || null,
            localidad: localidad || null,
            codigoPostal: codigoPostal || null,
            referencias: referencias || null,
            latitud: latitud || null,
            longitud: longitud || null,
            personaId: persona.id,
            seccionId: seccionId || null,
          },
        })
      }

      return persona
    })

    return NextResponse.json(persona)
  } catch (error) {
    console.error("Error al actualizar persona:", error)
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

    // Verificar si la persona existe
    const existingPersona = await db.persona.findUnique({
      where: { id },
      include: {
        seccion: true,
      },
    })

    if (!existingPersona) {
      return NextResponse.json({ error: "Persona no encontrada" }, { status: 404 })
    }

    // Verificar permisos: EDITOR y USER solo pueden eliminar personas de su distrito local y municipio
    if (session.user.role !== UserRole.SUPER_USER && session.user.role !== UserRole.ADMIN) {
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

      if (
        existingPersona.seccion?.distritoLocalId !== user.distritoLocalId ||
        existingPersona.seccion?.municipioId !== user.municipioId
      ) {
        return NextResponse.json({ error: "No tienes permisos para eliminar esta persona" }, { status: 403 })
      }
    }

    // Eliminar la persona (el domicilio se eliminará automáticamente por la relación)
    await db.persona.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar persona:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

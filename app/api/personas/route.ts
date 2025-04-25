import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { UserRole } from "@/lib/types"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    // Verificar si el usuario está autenticado
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    let personas

    // SUPER_USER y ADMIN pueden ver todas las personas
    if (session.user.role === UserRole.SUPER_USER || session.user.role === UserRole.ADMIN) {
      personas = await db.persona.findMany({
        include: {
          domicilio: true,
          seccion: true,
        },
      })
    }
    // EDITOR y USER solo pueden ver personas de su municipio
    else {
      // Obtener el usuario con su municipio
      const user = await db.user.findUnique({
        where: { id: session.user.id },
        include: { municipio: true },
      })

      if (!user?.municipioId) {
        return NextResponse.json({ error: "Usuario sin municipio asignado" }, { status: 400 })
      }

      personas = await db.persona.findMany({
        where: {
          domicilio: {
            municipioId: user.municipioId,
          },
        },
        include: {
          domicilio: true,
          seccion: true,
        },
      })
    }

    return NextResponse.json(personas)
  } catch (error) {
    console.error("Error al obtener personas:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Solo SUPER_USER, ADMIN y EDITOR pueden crear personas
    if (
      !session?.user ||
      (session.user.role !== UserRole.SUPER_USER &&
        session.user.role !== UserRole.ADMIN &&
        session.user.role !== UserRole.EDITOR)
    ) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Verificar que EDITOR solo crea personas en su municipio
    if (session.user.role === UserRole.EDITOR) {
      const body = await req.json()
      const user = await db.user.findUnique({
        where: { id: session.user.id },
        include: { municipio: true },
      })

      if (!user?.municipioId) {
        return NextResponse.json({ error: "Usuario sin municipio asignado" }, { status: 400 })
      }

      // Verificar que el municipio de la persona coincide con el del usuario
      const domicilio = await db.domicilio.findUnique({
        where: { id: body.domicilioId },
      })

      if (domicilio?.municipioId !== user.municipioId) {
        return NextResponse.json({ error: "No puedes crear personas fuera de tu municipio" }, { status: 403 })
      }
    }

    const body = await req.json()
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

    // Si el usuario no es admin, verificar que la sección pertenezca a su distrito/municipio
    if (session.user.role !== "admin" && session.user.role !== UserRole.EDITOR && seccionId) {
      const usuario = await db.user.findUnique({
        where: { id: session.user.id },
        include: {
          municipio: true,
          distritoLocal: true,
          distritoFederal: true,
        },
      })

      const seccion = await db.seccion.findUnique({
        where: { id: Number(seccionId) },
      })

      if (
        !seccion ||
        (seccion.municipioId !== usuario?.municipio?.id &&
          seccion.distritoLocalId !== usuario?.distritoLocal?.id &&
          seccion.distritoFederalId !== usuario?.distritoFederal?.id)
      ) {
        return NextResponse.json({ error: "No tienes permisos para crear personas en esta sección" }, { status: 403 })
      }
    }

    // Crear la persona y su domicilio en una transacción
    const persona = await db.$transaction(async (tx) => {
      // Crear la persona
      const persona = await tx.persona.create({
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

      // Crear el domicilio asociado a la persona
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

      return persona
    })

    return NextResponse.json(persona, { status: 201 })
  } catch (error) {
    console.error("Error al crear persona:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

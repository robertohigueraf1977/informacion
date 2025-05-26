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
    // EDITOR y USER solo pueden ver personas de su distrito local y municipio
    else {
      // Obtener el usuario con su distrito local y municipio
      const user = await db.user.findUnique({
        where: { id: session.user.id },
        include: {
          municipio: true,
          distritoLocal: true,
        },
      })

      if (!user?.distritoLocalId || !user?.municipioId) {
        return NextResponse.json({ error: "Usuario sin distrito local o municipio asignado" }, { status: 400 })
      }

      personas = await db.persona.findMany({
        where: {
          AND: [
            {
              seccion: {
                distritoLocalId: user.distritoLocalId,
              },
            },
            {
              seccion: {
                municipioId: user.municipioId,
              },
            },
          ],
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
    console.log("POST /api/personas - Iniciando")
    const session = await getServerSession(authOptions)
    console.log("POST /api/personas - Sesión:", session?.user?.role)

    // Solo SUPER_USER, ADMIN y EDITOR pueden crear personas
    if (
      !session?.user ||
      (session.user.role !== UserRole.SUPER_USER &&
        session.user.role !== UserRole.ADMIN &&
        session.user.role !== UserRole.EDITOR)
    ) {
      console.log("POST /api/personas - No autorizado, rol:", session?.user?.role)
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await req.json()
    console.log("POST /api/personas - Body recibido:", JSON.stringify(body, null, 2))

    // Verificar que EDITOR solo crea personas en su distrito local y municipio
    if (session.user.role === UserRole.EDITOR) {
      const user = await db.user.findUnique({
        where: { id: session.user.id },
        include: {
          municipio: true,
          distritoLocal: true,
        },
      })

      if (!user?.distritoLocalId || !user?.municipioId) {
        return NextResponse.json({ error: "Usuario sin distrito local o municipio asignado" }, { status: 400 })
      }

      // Verificar que la sección pertenece al distrito local y municipio del usuario
      if (body.seccionId) {
        const seccion = await db.seccion.findUnique({
          where: { id: Number(body.seccionId) },
        })

        if (!seccion || seccion.distritoLocalId !== user.distritoLocalId || seccion.municipioId !== user.municipioId) {
          return NextResponse.json(
            { error: "No puedes crear personas en secciones fuera de tu distrito local y municipio" },
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

    console.log("POST /api/personas - Validando campos requeridos")
    if (!nombre || !apellidoPaterno || !calle) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    console.log("POST /api/personas - Iniciando transacción")
    try {
      // Crear la persona y su domicilio en una transacción
      const persona = await db.$transaction(async (tx) => {
        console.log("POST /api/personas - Creando persona")
        // Crear la persona
        const persona = await tx.persona.create({
          data: {
            nombre,
            apellidoPaterno,
            apellidoMaterno: apellidoMaterno || null,
            fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
            curp: curp || null,
            claveElector: claveElector || null,
            seccionId: seccionId ? Number(seccionId) : null,
            telefono: telefono || null,
            email: email || null,
            sectorId: sectorId ? Number(sectorId) : null,
            referente: referente || false,
            referidoPorId: referidoPorId ? Number(referidoPorId) : null,
          },
        })

        console.log("POST /api/personas - Persona creada:", persona.id)
        console.log("POST /api/personas - Creando domicilio")

        // Crear el domicilio asociado a la persona
        const domicilio = await tx.domicilio.create({
          data: {
            calle,
            numero: numero || null,
            colonia: colonia || null,
            localidad: localidad || null,
            codigoPostal: codigoPostal || null,
            referencias: referencias || null,
            latitud: latitud ? Number.parseFloat(latitud) : null,
            longitud: longitud ? Number.parseFloat(longitud) : null,
            personaId: persona.id,
            seccionId: seccionId ? Number(seccionId) : null,
            municipioId: null,
          },
        })

        console.log("POST /api/personas - Domicilio creado:", domicilio.id)
        return persona
      })

      console.log("POST /api/personas - Transacción completada exitosamente")
      return NextResponse.json(persona, { status: 201 })
    } catch (txError) {
      console.error("POST /api/personas - Error en la transacción:", txError)
      return NextResponse.json(
        {
          error: "Error al crear la persona y su domicilio",
          details: txError.message,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("POST /api/personas - Error general:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

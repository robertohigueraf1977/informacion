import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"

// Mejorar la respuesta de la API para incluir más información de diagnóstico
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar si el usuario está autenticado
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Esperar a que los parámetros estén disponibles
    const resolvedParams = await params
    const id = Number.parseInt(resolvedParams.id)

    if (isNaN(id)) {
      console.error("ID de sección inválido:", resolvedParams.id)
      return NextResponse.json({ error: "ID de sección inválido" }, { status: 400 })
    }

    console.log("Buscando sección con ID:", id)

    // Obtener información detallada de la sección
    const seccion = await db.seccion.findUnique({
      where: { id },
      include: {
        municipio: true,
        distritoLocal: true,
        distritoFederal: true,
        _count: {
          select: {
            personas: true,
          },
        },
      },
    })

    if (!seccion) {
      console.log("Sección no encontrada:", id)

      // Intentar crear la sección si no existe
      try {
        console.log("Intentando crear la sección:", id)
        const nuevaSeccion = await db.seccion.create({
          data: {
            id: id,
            nombre: String(id),
          },
          include: {
            _count: {
              select: {
                personas: true,
              },
            },
          },
        })

        console.log("Sección creada:", nuevaSeccion)

        return NextResponse.json({
          personas: [],
          seccion: {
            ...nuevaSeccion,
            municipio: null,
            distritoLocal: null,
            distritoFederal: null,
          },
          _debug: {
            message: "Sección creada automáticamente",
            timestamp: new Date().toISOString(),
          },
        })
      } catch (createError) {
        console.error("Error al crear la sección:", createError)
        return NextResponse.json(
          {
            error: "Sección no encontrada y no se pudo crear automáticamente",
            details: createError instanceof Error ? createError.message : String(createError),
            _debug: {
              message: "Error al crear sección",
              timestamp: new Date().toISOString(),
            },
          },
          { status: 404 },
        )
      }
    }

    console.log("Sección encontrada:", seccion.nombre)

    // Obtener personas de la sección
    const personas = await db.persona.findMany({
      where: {
        seccionId: id,
      },
      select: {
        id: true,
        nombre: true,
        apellidoPaterno: true,
        apellidoMaterno: true,
        telefono: true,
        email: true,
        referente: true,
        sector: {
          select: {
            nombre: true,
          },
        },
        domicilio: {
          select: {
            calle: true,
            numero: true,
            colonia: true,
            localidad: true,
          },
        },
      },
      orderBy: [{ apellidoPaterno: "asc" }, { apellidoMaterno: "asc" }, { nombre: "asc" }],
    })

    console.log(`Encontradas ${personas.length} personas en la sección ${id}`)

    // Asegurarse de que la respuesta tenga la estructura correcta
    const response = {
      personas: personas || [],
      seccion: seccion || null,
      _debug: {
        message: "Datos obtenidos correctamente",
        timestamp: new Date().toISOString(),
        seccionId: id,
        personasCount: personas.length,
        seccionExists: !!seccion,
      },
    }

    console.log("Enviando respuesta:", JSON.stringify(response).substring(0, 200) + "...")

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error al obtener personas de la sección:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor: " + (error instanceof Error ? error.message : String(error)),
        stack: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.stack : null) : null,
        _debug: {
          message: "Error interno del servidor",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 },
    )
  }
}

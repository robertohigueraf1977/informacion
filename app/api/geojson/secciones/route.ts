import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar si el usuario está autenticado
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Ruta al archivo GeoJSON
    const filePath = path.join(process.cwd(), "data", "Secciones.geojson")

    // Verificar si el archivo existe
    try {
      await fs.access(filePath)
    } catch (error) {
      console.error("El archivo GeoJSON no existe en la ruta especificada:", filePath)
      return NextResponse.json(
        {
          error:
            "Archivo GeoJSON no encontrado. Asegúrate de colocar el archivo 'Secciones.geojson' en la carpeta 'data' en la raíz del proyecto.",
        },
        { status: 404 },
      )
    }

    // Leer el archivo
    const fileContents = await fs.readFile(filePath, "utf8")

    // Parsear el contenido como JSON
    try {
      const geoJsonData = JSON.parse(fileContents)
      console.log(
        "GeoJSON data loaded successfully:",
        geoJsonData.features ? `${geoJsonData.features.length} features` : "No features",
      )

      // Obtener todas las secciones con su información completa
      const secciones = await db.seccion.findMany({
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

      console.log(`Found ${secciones.length} sections in the database`)

      // Crear un mapa para acceder rápidamente a la información por nombre de sección
      const seccionesMap = new Map()
      secciones.forEach((seccion) => {
        seccionesMap.set(seccion.nombre, {
          id: seccion.id,
          personasCount: seccion._count.personas,
          municipioNombre: seccion.municipio?.nombre || "No asignado",
          distritoLocalNombre: seccion.distritoLocal?.nombre || "No asignado",
          distritoFederalNombre: seccion.distritoFederal?.nombre || "No asignado",
        })
      })

      // Modificar cada feature del GeoJSON para incluir la información adicional
      if (geoJsonData.features && Array.isArray(geoJsonData.features)) {
        geoJsonData.features.forEach((feature) => {
          if (feature.properties && feature.properties.SECCION) {
            const seccionNombre = feature.properties.SECCION
            const seccionInfo = seccionesMap.get(seccionNombre)

            if (seccionInfo) {
              // Añadir explícitamente la información a las propiedades
              feature.properties.SECCION_ID = seccionInfo.id
              feature.properties.PERSONAS_REGISTRADAS = seccionInfo.personasCount
              feature.properties.MUNICIPIO_NOMBRE = seccionInfo.municipioNombre
              feature.properties.DISTRITO_LOCAL_NOMBRE = seccionInfo.distritoLocalNombre
              feature.properties.DISTRITO_FEDERAL_NOMBRE = seccionInfo.distritoFederalNombre
            } else {
              // Si no encontramos la sección en la base de datos, intentamos usar el número de sección como ID
              const seccionId = Number.parseInt(seccionNombre, 10)
              feature.properties.SECCION_ID = !isNaN(seccionId) ? seccionId : null
              feature.properties.PERSONAS_REGISTRADAS = 0
              feature.properties.MUNICIPIO_NOMBRE = "No asignado"
              feature.properties.DISTRITO_LOCAL_NOMBRE = "No asignado"
              feature.properties.DISTRITO_FEDERAL_NOMBRE = "No asignado"
            }
          }
        })
      }

      return NextResponse.json(geoJsonData)
    } catch (error) {
      console.error("Error al parsear el archivo GeoJSON:", error)
      return NextResponse.json({ error: "El archivo GeoJSON no tiene un formato válido" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error al leer el archivo GeoJSON:", error)
    return NextResponse.json({ error: "Error al procesar el archivo GeoJSON" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import { getServerSession } from "next-auth/next"
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
        // Usar tanto el nombre como el ID como claves para mayor flexibilidad
        seccionesMap.set(seccion.nombre, {
          id: seccion.id,
          personasCount: seccion._count.personas,
          municipioNombre: seccion.municipio?.nombre || "No asignado",
          distritoLocalNombre: seccion.distritoLocal?.nombre || "No asignado",
          distritoFederalNombre: seccion.distritoFederal?.nombre || "No asignado",
          municipioId: seccion.municipio?.id || null,
          distritoLocalId: seccion.distritoLocal?.id || null,
          distritoFederalId: seccion.distritoFederal?.id || null,
        })

        // También mapear por ID si es diferente del nombre
        if (seccion.id.toString() !== seccion.nombre) {
          seccionesMap.set(seccion.id.toString(), {
            id: seccion.id,
            personasCount: seccion._count.personas,
            municipioNombre: seccion.municipio?.nombre || "No asignado",
            distritoLocalNombre: seccion.distritoLocal?.nombre || "No asignado",
            distritoFederalNombre: seccion.distritoFederal?.nombre || "No asignado",
            municipioId: seccion.municipio?.id || null,
            distritoLocalId: seccion.distritoLocal?.id || null,
            distritoFederalId: seccion.distritoFederal?.id || null,
          })
        }
      })

      // Modificar cada feature del GeoJSON para incluir la información adicional
      if (geoJsonData.features && Array.isArray(geoJsonData.features)) {
        let matchedFeatures = 0
        let unmatchedFeatures = 0

        geoJsonData.features.forEach((feature, index) => {
          if (feature.properties && feature.properties.SECCION) {
            const seccionNombre = feature.properties.SECCION.toString().trim()
            let seccionInfo = seccionesMap.get(seccionNombre)

            // Si no encontramos por nombre, intentar por ID numérico
            if (!seccionInfo) {
              const seccionId = Number.parseInt(seccionNombre, 10)
              if (!isNaN(seccionId)) {
                seccionInfo = seccionesMap.get(seccionId.toString())
              }
            }

            if (seccionInfo) {
              // Añadir información de la base de datos
              feature.properties.SECCION_ID = seccionInfo.id
              feature.properties.PERSONAS_REGISTRADAS = seccionInfo.personasCount
              feature.properties.MUNICIPIO_NOMBRE = seccionInfo.municipioNombre
              feature.properties.DISTRITO_LOCAL_NOMBRE = seccionInfo.distritoLocalNombre
              feature.properties.DISTRITO_FEDERAL_NOMBRE = seccionInfo.distritoFederalNombre
              feature.properties.MUNICIPIO_ID = seccionInfo.municipioId
              feature.properties.DISTRITO_LOCAL_ID = seccionInfo.distritoLocalId
              feature.properties.DISTRITO_FEDERAL_ID = seccionInfo.distritoFederalId
              matchedFeatures++
            } else {
              // Si no encontramos la sección en la base de datos
              const seccionId = Number.parseInt(seccionNombre, 10)
              feature.properties.SECCION_ID = !isNaN(seccionId) ? seccionId : null
              feature.properties.PERSONAS_REGISTRADAS = 0
              feature.properties.MUNICIPIO_NOMBRE = "No encontrado en BD"
              feature.properties.DISTRITO_LOCAL_NOMBRE = "No encontrado en BD"
              feature.properties.DISTRITO_FEDERAL_NOMBRE = "No encontrado en BD"
              feature.properties.MUNICIPIO_ID = null
              feature.properties.DISTRITO_LOCAL_ID = null
              feature.properties.DISTRITO_FEDERAL_ID = null
              unmatchedFeatures++

              console.warn(`Sección no encontrada en BD: ${seccionNombre}`)
            }
          } else {
            // Feature sin propiedad SECCION
            feature.properties = feature.properties || {}
            feature.properties.SECCION_ID = null
            feature.properties.PERSONAS_REGISTRADAS = 0
            feature.properties.MUNICIPIO_NOMBRE = "Sin información de sección"
            feature.properties.DISTRITO_LOCAL_NOMBRE = "Sin información de sección"
            feature.properties.DISTRITO_FEDERAL_NOMBRE = "Sin información de sección"
            feature.properties.MUNICIPIO_ID = null
            feature.properties.DISTRITO_LOCAL_ID = null
            feature.properties.DISTRITO_FEDERAL_ID = null
            unmatchedFeatures++
          }
        })

        console.log(`GeoJSON processing complete:`)
        console.log(`- Total features: ${geoJsonData.features.length}`)
        console.log(`- Matched with database: ${matchedFeatures}`)
        console.log(`- Unmatched: ${unmatchedFeatures}`)
        console.log(`- Database sections: ${secciones.length}`)
      }

      return NextResponse.json(geoJsonData)
    } catch (parseError) {
      console.error("Error al parsear el archivo GeoJSON:", parseError)
      return NextResponse.json({ error: "El archivo GeoJSON no tiene un formato válido" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error al procesar el archivo GeoJSON:", error)
    return NextResponse.json({ error: "Error al procesar el archivo GeoJSON" }, { status: 500 })
  }
}

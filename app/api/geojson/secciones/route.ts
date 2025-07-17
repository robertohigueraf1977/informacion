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

      // Obtener todas las secciones, municipios y distritos con su información completa
      const [secciones, municipios, distritosLocales, distritosFederales] = await Promise.all([
        db.seccion.findMany({
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
        }),
        db.municipio.findMany(),
        db.distritoLocal.findMany(),
        db.distritoFederal.findMany(),
      ])

      console.log(`Datos cargados de la BD:`)
      console.log(`- Secciones: ${secciones.length}`)
      console.log(`- Municipios: ${municipios.length}`)
      console.log(`- Distritos Locales: ${distritosLocales.length}`)
      console.log(`- Distritos Federales: ${distritosFederales.length}`)

      // Crear mapas para acceso rápido por ID y nombre
      const seccionesPorNombre = new Map()
      const municipiosPorId = new Map()
      const distritosLocalesPorId = new Map()
      const distritosFederalesPorId = new Map()

      // Mapear secciones por nombre (que es lo que coincide con SECCION del GeoJSON)
      secciones.forEach((seccion) => {
        const seccionData = {
          id: seccion.id,
          nombre: seccion.nombre,
          personasCount: seccion._count.personas,
          municipioNombre: seccion.municipio?.nombre || "No asignado",
          distritoLocalNombre: seccion.distritoLocal?.nombre || "No asignado",
          distritoFederalNombre: seccion.distritoFederal?.nombre || "No asignado",
          municipioId: seccion.municipio?.id || null,
          distritoLocalId: seccion.distritoLocal?.id || null,
          distritoFederalId: seccion.distritoFederal?.id || null,
        }

        // Mapear por nombre de sección (string y número)
        seccionesPorNombre.set(seccion.nombre, seccionData)
        seccionesPorNombre.set(seccion.nombre.toString(), seccionData)

        // También mapear por nombre como número si es posible
        const nombreNumerico = Number.parseInt(seccion.nombre.toString(), 10)
        if (!isNaN(nombreNumerico)) {
          seccionesPorNombre.set(nombreNumerico, seccionData)
        }
      })

      // Mapear municipios por ID
      municipios.forEach((municipio) => {
        municipiosPorId.set(municipio.id, municipio.nombre)
      })

      // Mapear distritos locales por ID
      distritosLocales.forEach((distrito) => {
        distritosLocalesPorId.set(distrito.id, distrito.nombre)
      })

      // Mapear distritos federales por ID
      distritosFederales.forEach((distrito) => {
        distritosFederalesPorId.set(distrito.id, distrito.nombre)
      })

      console.log(`Mapas creados:`)
      console.log(`- Secciones por nombre: ${seccionesPorNombre.size}`)
      console.log(`- Municipios por ID: ${municipiosPorId.size}`)
      console.log(`- Distritos Locales por ID: ${distritosLocalesPorId.size}`)
      console.log(`- Distritos Federales por ID: ${distritosFederalesPorId.size}`)

      // Función de búsqueda mejorada
      const buscarSeccion = (geoJsonSeccion: any) => {
        console.log(`🔍 Buscando sección: ${geoJsonSeccion} (tipo: ${typeof geoJsonSeccion})`)

        if (geoJsonSeccion === null || geoJsonSeccion === undefined) {
          console.log(`❌ SECCION es null o undefined`)
          return null
        }

        // Buscar por valor directo
        let resultado = seccionesPorNombre.get(geoJsonSeccion)
        if (resultado) {
          console.log(`✅ Encontrado por valor directo: ${geoJsonSeccion} -> ${resultado.nombre}`)
          return resultado
        }

        // Buscar por valor como string
        resultado = seccionesPorNombre.get(geoJsonSeccion.toString())
        if (resultado) {
          console.log(`✅ Encontrado por string: ${geoJsonSeccion} -> ${resultado.nombre}`)
          return resultado
        }

        // Buscar por valor como número
        const seccionNumerico = Number.parseInt(geoJsonSeccion.toString(), 10)
        if (!isNaN(seccionNumerico)) {
          resultado = seccionesPorNombre.get(seccionNumerico)
          if (resultado) {
            console.log(`✅ Encontrado por número: ${seccionNumerico} -> ${resultado.nombre}`)
            return resultado
          }
        }

        console.log(`❌ No se encontró sección para: ${geoJsonSeccion}`)
        return null
      }

      // Modificar cada feature del GeoJSON para incluir la información adicional
      if (geoJsonData.features && Array.isArray(geoJsonData.features)) {
        let matchedFeatures = 0
        let unmatchedFeatures = 0
        const mappingLog = []

        geoJsonData.features.forEach((feature, index) => {
          // Inicializar propiedades si no existen
          if (!feature.properties) {
            feature.properties = {}
          }

          // Extraer valores del GeoJSON
          const geoJsonId = feature.properties.ID
          const geoJsonSeccion = feature.properties.SECCION
          const geoJsonDistritoL = feature.properties.DISTRITO_L
          const geoJsonDistritoF = feature.properties.DISTRITO_F
          const geoJsonMunicipio = feature.properties.MUNICIPIO

          console.log(`\n--- Feature ${index} ---`)
          console.log(`ID: ${geoJsonId}`)
          console.log(`SECCION: ${geoJsonSeccion}`)
          console.log(`DISTRITO_L: ${geoJsonDistritoL}`)
          console.log(`DISTRITO_F: ${geoJsonDistritoF}`)
          console.log(`MUNICIPIO: ${geoJsonMunicipio}`)

          // Buscar la sección en la BD
          const seccionInfo = buscarSeccion(geoJsonSeccion)

          // Obtener nombres de municipio y distritos por ID
          const municipioNombre = municipiosPorId.get(geoJsonMunicipio) || "Municipio no encontrado"
          const distritoLocalNombre = distritosLocalesPorId.get(geoJsonDistritoL) || "Distrito Local no encontrado"
          const distritoFederalNombre =
            distritosFederalesPorId.get(geoJsonDistritoF) || "Distrito Federal no encontrado"

          if (seccionInfo) {
            // Enriquecer el feature con información de la base de datos
            feature.properties.BD_ID = seccionInfo.id
            feature.properties.BD_NOMBRE = seccionInfo.nombre
            feature.properties.PERSONAS_REGISTRADAS = seccionInfo.personasCount

            // Usar los nombres obtenidos por ID del GeoJSON (más confiables)
            feature.properties.MUNICIPIO_NOMBRE = municipioNombre
            feature.properties.DISTRITO_LOCAL_NOMBRE = distritoLocalNombre
            feature.properties.DISTRITO_FEDERAL_NOMBRE = distritoFederalNombre

            // IDs para referencia
            feature.properties.MUNICIPIO_ID = geoJsonMunicipio
            feature.properties.DISTRITO_LOCAL_ID = geoJsonDistritoL
            feature.properties.DISTRITO_FEDERAL_ID = geoJsonDistritoF

            // Campos para coloración (usar los nombres obtenidos)
            feature.properties.DISTRITO_L_NOMBRE = distritoLocalNombre
            feature.properties.DISTRITO_F_NOMBRE = distritoFederalNombre
            feature.properties.MUNICIPIO_NOMBRE_COLORACION = municipioNombre

            matchedFeatures++

            const mappingInfo = {
              index,
              geoJsonId,
              geoJsonSeccion,
              bdId: seccionInfo.id,
              bdNombre: seccionInfo.nombre,
              municipioNombre,
              distritoLocalNombre,
              distritoFederalNombre,
              status: "MATCHED",
            }
            mappingLog.push(mappingInfo)

            console.log(`✅ Feature ${index} MAPEADO:`)
            console.log(`   GeoJSON SECCION: ${geoJsonSeccion} -> BD: ${seccionInfo.nombre}`)
            console.log(`   Municipio ID ${geoJsonMunicipio} -> ${municipioNombre}`)
            console.log(`   Distrito Local ID ${geoJsonDistritoL} -> ${distritoLocalNombre}`)
            console.log(`   Distrito Federal ID ${geoJsonDistritoF} -> ${distritoFederalNombre}`)
          } else {
            // Si no encontramos la sección en la base de datos
            feature.properties.BD_ID = null
            feature.properties.BD_NOMBRE = null
            feature.properties.PERSONAS_REGISTRADAS = 0

            // Aún podemos obtener los nombres de municipio y distritos por ID
            feature.properties.MUNICIPIO_NOMBRE = municipioNombre
            feature.properties.DISTRITO_LOCAL_NOMBRE = distritoLocalNombre
            feature.properties.DISTRITO_FEDERAL_NOMBRE = distritoFederalNombre

            feature.properties.MUNICIPIO_ID = geoJsonMunicipio
            feature.properties.DISTRITO_LOCAL_ID = geoJsonDistritoL
            feature.properties.DISTRITO_FEDERAL_ID = geoJsonDistritoF

            // Campos para coloración
            feature.properties.DISTRITO_L_NOMBRE = distritoLocalNombre
            feature.properties.DISTRITO_F_NOMBRE = distritoFederalNombre
            feature.properties.MUNICIPIO_NOMBRE_COLORACION = municipioNombre

            unmatchedFeatures++

            const mappingInfo = {
              index,
              geoJsonId,
              geoJsonSeccion,
              bdId: null,
              bdNombre: null,
              municipioNombre,
              distritoLocalNombre,
              distritoFederalNombre,
              status: "SECTION_NOT_FOUND",
            }
            mappingLog.push(mappingInfo)

            console.log(`⚠️ Feature ${index} SECCIÓN NO ENCONTRADA:`)
            console.log(`   GeoJSON SECCION: ${geoJsonSeccion} (no existe en BD)`)
            console.log(`   Pero sí se obtuvieron nombres por ID:`)
            console.log(`   Municipio ID ${geoJsonMunicipio} -> ${municipioNombre}`)
            console.log(`   Distrito Local ID ${geoJsonDistritoL} -> ${distritoLocalNombre}`)
            console.log(`   Distrito Federal ID ${geoJsonDistritoF} -> ${distritoFederalNombre}`)
          }
        })

        console.log(`\n=== RESUMEN DE MAPEO ===`)
        console.log(`Total features: ${geoJsonData.features.length}`)
        console.log(`Secciones mapeadas: ${matchedFeatures}`)
        console.log(`Secciones no encontradas: ${unmatchedFeatures}`)
        console.log(`Secciones en BD: ${secciones.length}`)
        console.log(
          `Porcentaje de éxito en secciones: ${((matchedFeatures / geoJsonData.features.length) * 100).toFixed(2)}%`,
        )

        // Log detallado de los primeros 5 mapeos para depuración
        console.log(`\n=== PRIMEROS 5 MAPEOS ===`)
        mappingLog.slice(0, 5).forEach((log) => {
          console.log(`Feature ${log.index}: ${log.status}`)
          console.log(`  GeoJSON SECCION: ${log.geoJsonSeccion}`)
          console.log(`  BD: ID=${log.bdId}, NOMBRE=${log.bdNombre}`)
          console.log(`  Municipio: ${log.municipioNombre}`)
          console.log(`  Distrito Local: ${log.distritoLocalNombre}`)
          console.log(`  Distrito Federal: ${log.distritoFederalNombre}`)
        })
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

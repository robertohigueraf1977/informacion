import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { UserRole } from "@prisma/client"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar autenticación y permisos
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Solo SUPER_USER y ADMIN pueden importar datos electorales
    if (session.user.role !== UserRole.SUPER_USER && session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "No tienes permisos para importar datos electorales" }, { status: 403 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó archivo" }, { status: 400 })
    }

    const text = await file.text()
    const lines = text.split("\n").filter((line) => line.trim())

    if (lines.length < 2) {
      return NextResponse.json({ error: "El archivo CSV debe contener al menos una fila de datos" }, { status: 400 })
    }

    const headers = lines[0].split("\t").map((h) => h.trim()) // Usar tabulador como separador
    const dataLines = lines.slice(1)

    // Validar headers requeridos
    const requiredHeaders = ["DISTRITO_F", "DISTRITO_L", "MUNICIPIO", "SECCION", "LISTA_NOMINAL"]
    const missingHeaders = requiredHeaders.filter((header) => !headers.includes(header))

    if (missingHeaders.length > 0) {
      return NextResponse.json({ error: `Faltan columnas requeridas: ${missingHeaders.join(", ")}` }, { status: 400 })
    }

    // Mapeo completo de partidos y coaliciones
    const entidadesPoliticas = new Map([
      // Partidos individuales
      ["PAN", { tipo: "PARTIDO", nombre: "Partido Acción Nacional", siglas: "PAN" }],
      ["PRI", { tipo: "PARTIDO", nombre: "Partido Revolucionario Institucional", siglas: "PRI" }],
      ["PRD", { tipo: "PARTIDO", nombre: "Partido de la Revolución Democrática", siglas: "PRD" }],
      ["PVEM", { tipo: "PARTIDO", nombre: "Partido Verde Ecologista de México", siglas: "PVEM" }],
      ["PT", { tipo: "PARTIDO", nombre: "Partido del Trabajo", siglas: "PT" }],
      ["MC", { tipo: "PARTIDO", nombre: "Movimiento Ciudadano", siglas: "MC" }],
      ["MORENA", { tipo: "PARTIDO", nombre: "Movimiento Regeneración Nacional", siglas: "MORENA" }],

      // Coaliciones
      ["PAN-PRI-PRD", { tipo: "COALICION", nombre: "Va por México", siglas: "PAN-PRI-PRD" }],
      ["PAN-PRI", { tipo: "COALICION", nombre: "PAN-PRI", siglas: "PAN-PRI" }],
      ["PAN-PRD", { tipo: "COALICION", nombre: "PAN-PRD", siglas: "PAN-PRD" }],
      ["PRI-PRD", { tipo: "COALICION", nombre: "PRI-PRD", siglas: "PRI-PRD" }],
      ["PVEM_PT_MORENA", { tipo: "COALICION", nombre: "Juntos Haremos Historia", siglas: "PVEM-PT-MORENA" }],
      ["PVEM_MORENA", { tipo: "COALICION", nombre: "PVEM-MORENA", siglas: "PVEM-MORENA" }],
      ["PT_MORENA", { tipo: "COALICION", nombre: "PT-MORENA", siglas: "PT-MORENA" }],
      ["PVEM_PT", { tipo: "COALICION", nombre: "PVEM-PT", siglas: "PVEM-PT" }],

      // Categorías especiales
      ["NO_REGISTRADAS", { tipo: "ESPECIAL", nombre: "Candidaturas No Registradas", siglas: "NO_REG" }],
      ["NULOS", { tipo: "ESPECIAL", nombre: "Votos Nulos", siglas: "NULOS" }],
    ])

    // Contadores para el resultado
    const created = {
      distritosFederales: 0,
      distritosLocales: 0,
      municipios: 0,
      secciones: 0,
      casillas: 0,
      partidos: 0,
      votos: 0,
    }

    const errors: string[] = []
    let processed = 0

    // Crear mapas para evitar duplicados
    const distritosFederalesMap = new Map()
    const distritosLocalesMap = new Map()
    const municipiosMap = new Map()
    const seccionesMap = new Map()
    const partidosMap = new Map()

    // Crear o verificar partidos/coaliciones
    for (const [siglas, info] of entidadesPoliticas) {
      let partido = await db.partido.findFirst({
        where: { siglas: info.siglas },
      })

      if (!partido) {
        partido = await db.partido.create({
          data: {
            nombre: info.nombre,
            siglas: info.siglas,
            color: getColorForParty(info.siglas),
          },
        })
        created.partidos++
      }
      partidosMap.set(siglas, partido.id)
    }

    for (const [index, line] of dataLines.entries()) {
      try {
        const values = line.split("\t").map((v) => v.trim()) // Usar tabulador como separador
        const rowData: Record<string, string> = {}

        headers.forEach((header, i) => {
          rowData[header] = values[i] || ""
        })

        const distritoFederal = rowData["DISTRITO_F"]
        const distritoLocal = rowData["DISTRITO_L"]
        const municipio = rowData["MUNICIPIO"]
        const seccion = rowData["SECCION"]
        const listaNominal = Number.parseInt(rowData["LISTA_NOMINAL"]) || 0

        if (!distritoFederal || !distritoLocal || !municipio || !seccion) {
          errors.push(`Fila ${index + 2}: Faltan datos requeridos`)
          continue
        }

        // Crear o obtener distrito federal
        let distritoFederalId: number
        if (distritosFederalesMap.has(distritoFederal)) {
          distritoFederalId = distritosFederalesMap.get(distritoFederal)
        } else {
          const existingDF = await db.distritoFederal.findFirst({
            where: { nombre: distritoFederal },
          })

          if (existingDF) {
            distritoFederalId = existingDF.id
          } else {
            const newDF = await db.distritoFederal.create({
              data: { nombre: distritoFederal, numero: Number.parseInt(distritoFederal) || 0 },
            })
            distritoFederalId = newDF.id
            created.distritosFederales++
          }
          distritosFederalesMap.set(distritoFederal, distritoFederalId)
        }

        // Crear o obtener distrito local
        let distritoLocalId: number
        if (distritosLocalesMap.has(distritoLocal)) {
          distritoLocalId = distritosLocalesMap.get(distritoLocal)
        } else {
          const existingDL = await db.distritoLocal.findFirst({
            where: { nombre: distritoLocal },
          })

          if (existingDL) {
            distritoLocalId = existingDL.id
          } else {
            const newDL = await db.distritoLocal.create({
              data: { nombre: distritoLocal, numero: Number.parseInt(distritoLocal) || 0 },
            })
            distritoLocalId = newDL.id
            created.distritosLocales++
          }
          distritosLocalesMap.set(distritoLocal, distritoLocalId)
        }

        // Crear o obtener municipio
        let municipioId: number
        if (municipiosMap.has(municipio)) {
          municipioId = municipiosMap.get(municipio)
        } else {
          const existingMunicipio = await db.municipio.findFirst({
            where: { nombre: municipio },
          })

          if (existingMunicipio) {
            municipioId = existingMunicipio.id
          } else {
            const newMunicipio = await db.municipio.create({
              data: { nombre: municipio },
            })
            municipioId = newMunicipio.id
            created.municipios++
          }
          municipiosMap.set(municipio, municipioId)
        }

        // Crear o obtener sección
        const seccionKey = `${seccion}-${municipioId}-${distritoLocalId}`
        let seccionObj: any

        if (seccionesMap.has(seccionKey)) {
          seccionObj = seccionesMap.get(seccionKey)
        } else {
          const existingSeccion = await db.seccion.findFirst({
            where: {
              numero: Number.parseInt(seccion),
              municipioId: municipioId,
              distritoLocalId: distritoLocalId,
            },
          })

          if (existingSeccion) {
            seccionObj = existingSeccion
          } else {
            seccionObj = await db.seccion.create({
              data: {
                numero: Number.parseInt(seccion),
                nombre: `Sección ${seccion}`,
                municipioId: municipioId,
                distritoLocalId: distritoLocalId,
                distritoFederalId: distritoFederalId,
              },
            })
            created.secciones++
          }
          seccionesMap.set(seccionKey, seccionObj)
        }

        // Crear o obtener casilla
        let casilla = await db.casilla.findFirst({
          where: {
            numero: seccion,
            seccionId: seccionObj.id,
          },
        })

        if (!casilla) {
          casilla = await db.casilla.create({
            data: {
              numero: seccion,
              tipo: "BASICA",
              seccionId: seccionObj.id,
              listaNominal: listaNominal,
            },
          })
          created.casillas++
        } else if (casilla.listaNominal !== listaNominal) {
          // Actualizar lista nominal si es diferente
          await db.casilla.update({
            where: { id: casilla.id },
            data: { listaNominal: listaNominal },
          })
        }

        // Procesar votos por cada entidad política
        for (const [columna, partidoId] of partidosMap) {
          const votosStr = rowData[columna]
          if (votosStr && votosStr !== "" && !isNaN(Number(votosStr))) {
            const cantidad = Number.parseInt(votosStr)

            if (cantidad >= 0) {
              // Permitir 0 votos
              // Verificar si ya existe el voto
              const existingVoto = await db.voto.findFirst({
                where: {
                  casillaId: casilla.id,
                  partidoId: partidoId,
                },
              })

              if (!existingVoto) {
                await db.voto.create({
                  data: {
                    casillaId: casilla.id,
                    partidoId: partidoId,
                    cantidad: cantidad,
                  },
                })
                created.votos++
              } else if (existingVoto.cantidad !== cantidad) {
                // Actualizar si es diferente
                await db.voto.update({
                  where: { id: existingVoto.id },
                  data: { cantidad: cantidad },
                })
              }
            }
          }
        }

        processed++
      } catch (error) {
        errors.push(`Fila ${index + 2}: Error al procesar - ${error}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Importación completada",
      processed,
      errors,
      created,
    })
  } catch (error) {
    console.error("Error en importación:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// Función para asignar colores a partidos
function getColorForParty(siglas: string): string {
  const colores: Record<string, string> = {
    PAN: "#0066CC",
    PRI: "#FF0000",
    PRD: "#FFFF00",
    PVEM: "#00FF00",
    PT: "#FF6600",
    MC: "#FF9900",
    MORENA: "#8B4513",
    "PAN-PRI-PRD": "#6B46C1",
    "PVEM-PT-MORENA": "#9F7AEA",
    NO_REG: "#6B7280",
    NULOS: "#374151",
  }
  return colores[siglas] || "#6B7280"
}

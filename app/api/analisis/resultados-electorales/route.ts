import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { UserRole } from "@prisma/client"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const distritoFederal = searchParams.get("distritoFederal")
    const distritoLocal = searchParams.get("distritoLocal")
    const municipio = searchParams.get("municipio")
    const seccion = searchParams.get("seccion")

    // Construir filtros según permisos del usuario
    let whereClause: any = {}

    // Aplicar filtros de permisos por rol
    if (session.user.role === UserRole.EDITOR || session.user.role === UserRole.USER) {
      if (!session.user.distritoLocalId || !session.user.municipioId) {
        return NextResponse.json({ error: "Usuario sin distrito local o municipio asignado" }, { status: 403 })
      }

      whereClause = {
        seccion: {
          distritoLocalId: session.user.distritoLocalId,
          municipioId: session.user.municipioId,
        },
      }
    }

    // Aplicar filtros adicionales de búsqueda
    if (distritoFederal) {
      whereClause.seccion = {
        ...whereClause.seccion,
        distritoFederal: { nombre: distritoFederal },
      }
    }

    if (distritoLocal) {
      whereClause.seccion = {
        ...whereClause.seccion,
        distritoLocal: { nombre: distritoLocal },
      }
    }

    if (municipio) {
      whereClause.seccion = {
        ...whereClause.seccion,
        municipio: { nombre: municipio },
      }
    }

    if (seccion) {
      whereClause.seccion = {
        ...whereClause.seccion,
        numero: Number.parseInt(seccion),
      }
    }

    // Obtener datos de casillas con votos
    const casillas = await db.casilla.findMany({
      where: whereClause,
      include: {
        votos: {
          include: {
            partido: true,
          },
        },
        seccion: {
          include: {
            municipio: true,
            distritoLocal: true,
            distritoFederal: true,
          },
        },
      },
    })

    // Procesar y agregar resultados
    const resultados = {
      totalVotos: 0,
      totalListaNominal: 0,
      totalCasillas: casillas.length,
      participacion: 0,
      resultadosPorPartido: new Map<string, any>(),
      resultadosPorDistrito: new Map<string, any>(),
      resultadosPorMunicipio: new Map<string, any>(),
      coaliciones: {
        "Va por México": {
          votos: 0,
          porcentaje: 0,
          partidos: ["PAN", "PRI", "PRD", "PAN-PRI-PRD", "PAN-PRI", "PAN-PRD", "PRI-PRD"],
        },
        "Juntos Haremos Historia": {
          votos: 0,
          porcentaje: 0,
          partidos: ["MORENA", "PT", "PVEM", "PVEM-PT-MORENA", "PVEM-MORENA", "PT-MORENA", "PVEM-PT"],
        },
        "Movimiento Ciudadano": { votos: 0, porcentaje: 0, partidos: ["MC"] },
      },
    }

    // Procesar cada casilla
    for (const casilla of casillas) {
      resultados.totalListaNominal += casilla.listaNominal || 0

      const distritoKey = casilla.seccion.distritoLocal.nombre
      const municipioKey = casilla.seccion.municipio.nombre

      // Inicializar contadores por distrito y municipio
      if (!resultados.resultadosPorDistrito.has(distritoKey)) {
        resultados.resultadosPorDistrito.set(distritoKey, {
          nombre: distritoKey,
          votos: 0,
          listaNominal: 0,
          casillas: 0,
          partidos: new Map(),
        })
      }

      if (!resultados.resultadosPorMunicipio.has(municipioKey)) {
        resultados.resultadosPorMunicipio.set(municipioKey, {
          nombre: municipioKey,
          votos: 0,
          listaNominal: 0,
          casillas: 0,
          partidos: new Map(),
        })
      }

      const distritoData = resultados.resultadosPorDistrito.get(distritoKey)
      const municipioData = resultados.resultadosPorMunicipio.get(municipioKey)

      distritoData.listaNominal += casilla.listaNominal || 0
      municipioData.listaNominal += casilla.listaNominal || 0
      distritoData.casillas++
      municipioData.casillas++

      // Procesar votos de la casilla
      for (const voto of casilla.votos) {
        const partidoSiglas = voto.partido.siglas
        const cantidad = voto.cantidad

        resultados.totalVotos += cantidad

        // Agregar a resultados por partido
        if (!resultados.resultadosPorPartido.has(partidoSiglas)) {
          resultados.resultadosPorPartido.set(partidoSiglas, {
            nombre: voto.partido.nombre,
            siglas: partidoSiglas,
            votos: 0,
            porcentaje: 0,
            color: voto.partido.color,
          })
        }

        const partidoData = resultados.resultadosPorPartido.get(partidoSiglas)
        partidoData.votos += cantidad

        // Agregar a distrito
        if (!distritoData.partidos.has(partidoSiglas)) {
          distritoData.partidos.set(partidoSiglas, 0)
        }
        distritoData.partidos.set(partidoSiglas, distritoData.partidos.get(partidoSiglas) + cantidad)
        distritoData.votos += cantidad

        // Agregar a municipio
        if (!municipioData.partidos.has(partidoSiglas)) {
          municipioData.partidos.set(partidoSiglas, 0)
        }
        municipioData.partidos.set(partidoSiglas, municipioData.partidos.get(partidoSiglas) + cantidad)
        municipioData.votos += cantidad

        // Agregar a coaliciones
        for (const [coalicionNombre, coalicionData] of Object.entries(resultados.coaliciones)) {
          if (coalicionData.partidos.includes(partidoSiglas)) {
            coalicionData.votos += cantidad
          }
        }
      }
    }

    // Calcular porcentajes
    if (resultados.totalVotos > 0) {
      // Porcentajes por partido
      for (const [siglas, data] of resultados.resultadosPorPartido) {
        data.porcentaje = (data.votos / resultados.totalVotos) * 100
      }

      // Porcentajes por coalición
      for (const coalicionData of Object.values(resultados.coaliciones)) {
        coalicionData.porcentaje = (coalicionData.votos / resultados.totalVotos) * 100
      }
    }

    // Calcular participación
    if (resultados.totalListaNominal > 0) {
      resultados.participacion = (resultados.totalVotos / resultados.totalListaNominal) * 100
    }

    // Convertir Maps a Arrays para JSON
    const response = {
      ...resultados,
      resultadosPorPartido: Array.from(resultados.resultadosPorPartido.values()).sort((a, b) => b.votos - a.votos),
      resultadosPorDistrito: Array.from(resultados.resultadosPorDistrito.values()).sort((a, b) => b.votos - a.votos),
      resultadosPorMunicipio: Array.from(resultados.resultadosPorMunicipio.values()).sort((a, b) => b.votos - a.votos),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error en análisis electoral:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

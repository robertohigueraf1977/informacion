"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { StatCard } from "@/components/ui/stat-card"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { Users, Vote, TrendingUp, Target, MapPin, BarChart3, Flag, Trophy, AlertTriangle, CheckCircle } from 'lucide-react'

interface ResultsSummaryProps {
  data: any[]
  selectedMunicipio?: string
  selectedDistrito?: string
  selectedSeccion?: string
}

// Partidos mexicanos específicos (excluyendo DISTRITO_F y DISTRITO_L)
const MEXICAN_PARTIES = [
  'PAN', 'PVEM_PT', 'PRI', 'PVEM', 'NO_REGISTRADAS', 'NULOS', 'PT', 'MC', 'PRD',
  'PAN-PRI-PRD', 'PAN-PRI', 'PAN-PRD', 'PRI-PRD', 'PVEM_PT_MORENA', 'PVEM_MORENA',
  'PT_MORENA', 'MORENA'
]

// Colores oficiales de partidos mexicanos
const PARTY_COLORS: Record<string, string> = {
  'PAN': '#0066CC',           // Azul oficial
  'PRI': '#FF0000',           // Rojo oficial
  'PRD': '#FFFF00',           // Amarillo oficial
  'PVEM': '#00AA00',          // Verde oficial
  'PT': '#CC0000',            // Rojo oscuro
  'MC': '#FF6600',            // Naranja oficial
  'MORENA': '#8B4513',        // Café/Marrón oficial
  'NULOS': '#808080',         // Gris
  'NO_REGISTRADAS': '#C0C0C0', // Gris claro
  'PVEM_PT': '#66AA66',       // Verde claro (coalición)
  'PAN-PRI-PRD': '#6666CC',   // Mezcla azul-rojo-amarillo
  'PAN-PRI': '#8033CC',       // Mezcla azul-rojo
  'PAN-PRD': '#80CC33',       // Mezcla azul-amarillo
  'PRI-PRD': '#FF8000',       // Mezcla rojo-amarillo
  'PVEM_PT_MORENA': '#4D7A4D', // Verde-café
  'PVEM_MORENA': '#5D8A5D',   // Verde-café claro
  'PT_MORENA': '#A0522D'      // Rojo-café
}

const PARTY_NAMES: Record<string, string> = {
  'PAN': 'Partido Acción Nacional',
  'PRI': 'Partido Revolucionario Institucional',
  'PRD': 'Partido de la Revolución Democrática',
  'PVEM': 'Partido Verde Ecologista de México',
  'PT': 'Partido del Trabajo',
  'MC': 'Movimiento Ciudadano',
  'MORENA': 'Movimiento Regeneración Nacional',
  'PVEM_PT': 'Coalición PVEM-PT',
  'NO_REGISTRADAS': 'Candidaturas No Registradas',
  'NULOS': 'Votos Nulos',
  'PAN-PRI-PRD': 'Coalición PAN-PRI-PRD',
  'PAN-PRI': 'Coalición PAN-PRI',
  'PAN-PRD': 'Coalición PAN-PRD',
  'PRI-PRD': 'Coalición PRI-PRD',
  'PVEM_PT_MORENA': 'Coalición PVEM-PT-MORENA',
  'PVEM_MORENA': 'Coalición PVEM-MORENA',
  'PT_MORENA': 'Coalición PT-MORENA'
}

export function ResultsSummary({
  data,
  selectedMunicipio = "todos",
  selectedDistrito = "todos",
  selectedSeccion = "todos"
}: ResultsSummaryProps) {

  const summary = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return {
        totalVotos: 0,
        totalListaNominal: 0,
        participacion: 0,
        totalSecciones: 0,
        totalMunicipios: 0,
        totalDistritos: 0,
        partidoGanador: null,
        partidoSegundo: null,
        partidoTercero: null,
        margenVictoria: 0,
        competitividad: 'No disponible',
        partidos: [],
        municipiosCompetitivos: [],
        seccionesAltas: [],
        seccionesBajas: []
      }
    }

    // Filtrar datos según selección
    let filteredData = [...data]

    if (selectedMunicipio !== "todos") {
      filteredData = filteredData.filter(row =>
        (row.MUNICIPIO || row.municipio) === selectedMunicipio
      )
    }

    if (selectedDistrito !== "todos") {
      filteredData = filteredData.filter(row =>
        (row.DISTRITO || row.distrito) === selectedDistrito
      )
    }

    if (selectedSeccion !== "todos") {
      filteredData = filteredData.filter(row =>
        (row.SECCION || row.seccion)?.toString() === selectedSeccion
      )
    }

    // Calcular totales generales
    let totalVotos = 0
    let totalListaNominal = 0
    const partidoTotales: Record<string, number> = {}

    // Inicializar contadores de partidos
    MEXICAN_PARTIES.forEach(party => {
      partidoTotales[party] = 0
    })

    // Procesar cada fila de datos filtrados
    filteredData.forEach(row => {
      const listaNominal = Number(row.LISTA_NOMINAL) || 0
      totalListaNominal += listaNominal

      MEXICAN_PARTIES.forEach(party => {
        const votos = Number(row[party]) || 0
        partidoTotales[party] += votos
        totalVotos += votos
      })
    })

    // Calcular participación
    const participacion = totalListaNominal > 0 ? (totalVotos / totalListaNominal) * 100 : 0

    // Obtener conteos únicos de los datos filtrados
    const totalSecciones = filteredData.length
    const totalMunicipios = new Set(filteredData.map(row => row.MUNICIPIO || row.municipio).filter(Boolean)).size
    const totalDistritos = new Set(filteredData.map(row => row.DISTRITO || row.distrito).filter(Boolean)).size

    // Crear array de partidos con resultados
    const partidos = MEXICAN_PARTIES
      .map(party => ({
        nombre: party,
        nombreCompleto: PARTY_NAMES[party] || party,
        votos: partidoTotales[party],
        porcentaje: totalVotos > 0 ? (partidoTotales[party] / totalVotos) * 100 : 0,
        color: PARTY_COLORS[party] || '#8884d8',
        tipo: party === 'NULOS' ? 'nulos' :
          party === 'NO_REGISTRADAS' ? 'no_registradas' :
            party.includes('-') || party.includes('_') ? 'coalicion' : 'partido'
      }))
      .filter(partido => partido.votos > 0)
      .sort((a, b) => b.votos - a.votos)

    // Identificar los tres primeros lugares
    const partidoGanador = partidos[0] || null
    const partidoSegundo = partidos[1] || null
    const partidoTercero = partidos[2] || null

    // Calcular margen de victoria
    const margenVictoria = partidoGanador && partidoSegundo
      ? partidoGanador.porcentaje - partidoSegundo.porcentaje
      : 0

    // Determinar competitividad
    let competitividad = 'No competitivo'
    if (margenVictoria < 5) competitividad = 'Muy competitivo'
    else if (margenVictoria < 10) competitividad = 'Competitivo'
    else if (margenVictoria < 20) competitividad = 'Moderadamente competitivo'

    // Análisis por municipio (solo si no hay filtro de municipio específico)
    const municipiosCompetitivos: any[] = []
    if (selectedMunicipio === "todos" && filteredData.length > 0) {
      const municipioMap = new Map()
      filteredData.forEach(row => {
        const municipio = row.MUNICIPIO || row.municipio || 'Sin especificar'
        if (!municipioMap.has(municipio)) {
          municipioMap.set(municipio, {
            nombre: municipio,
            totalVotos: 0,
            listaNominal: 0,
            partidos: {}
          })
        }

        const munData = municipioMap.get(municipio)
        munData.listaNominal += Number(row.LISTA_NOMINAL) || 0

        MEXICAN_PARTIES.forEach(party => {
          const votos = Number(row[party]) || 0
          if (!munData.partidos[party]) munData.partidos[party] = 0
          munData.partidos[party] += votos
          munData.totalVotos += votos
        })
      })

      // Identificar municipios competitivos (diferencia < 10% entre primero y segundo)
      municipiosCompetitivos.push(...Array.from(municipioMap.values())
        .map(mun => {
          const partidosMun = MEXICAN_PARTIES
            .map(party => ({
              partido: party,
              votos: mun.partidos[party] || 0,
              porcentaje: mun.totalVotos > 0 ? ((mun.partidos[party] || 0) / mun.totalVotos) * 100 : 0
            }))
            .filter(p => p.votos > 0)
            .sort((a, b) => b.votos - a.votos)

          const primero = partidosMun[0]
          const segundo = partidosMun[1]
          const margen = primero && segundo ? primero.porcentaje - segundo.porcentaje : 100

          return {
            ...mun,
            margen,
            ganador: primero?.partido,
            participacion: mun.listaNominal > 0 ? (mun.totalVotos / mun.listaNominal) * 100 : 0
          }
        })
        .filter(mun => mun.margen < 10)
        .sort((a, b) => a.margen - b.margen)
        .slice(0, 5))
    }

    // Secciones con mayor y menor participación
    const seccionesConParticipacion = filteredData.map(row => {
      const totalSeccion = MEXICAN_PARTIES.reduce((sum, party) => sum + (Number(row[party]) || 0), 0)
      const listaNominal = Number(row.LISTA_NOMINAL) || 0
      const participacion = listaNominal > 0 ? (totalSeccion / listaNominal) * 100 : 0

      return {
        seccion: row.SECCION || row.seccion,
        municipio: row.MUNICIPIO || row.municipio,
        distrito: row.DISTRITO || row.distrito,
        participacion,
        totalVotos: totalSeccion,
        listaNominal
      }
    })

    const seccionesAltas = seccionesConParticipacion
      .sort((a, b) => b.participacion - a.participacion)
      .slice(0, 5)

    const seccionesBajas = seccionesConParticipacion
      .sort((a, b) => a.participacion - b.participacion)
      .slice(0, 5)

    return {
      totalVotos,
      totalListaNominal,
      participacion,
      totalSecciones,
      totalMunicipios,
      totalDistritos,
      partidoGanador,
      partidoSegundo,
      partidoTercero,
      margenVictoria,
      competitividad,
      partidos,
      municipiosCompetitivos,
      seccionesAltas,
      seccionesBajas
    }
  }, [data, selectedMunicipio, selectedDistrito, selectedSeccion])

  const getFilterText = () => {
    const filters = []
    if (selectedMunicipio !== "todos") filters.push(`Municipio: ${selectedMunicipio}`)
    if (selectedDistrito !== "todos") filters.push(`Distrito: ${selectedDistrito}`)
    if (selectedSeccion !== "todos") filters.push(`Sección: ${selectedSeccion}`)
    return filters.length > 0 ? ` (${filters.join(', ')})` : ''
  }

  return (
    <div className="space-y-6">
      {/* Encabezado con filtros activos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5" />
            Resumen Electoral{getFilterText()}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total de Votos"
          value={<AnimatedCounter end={summary.totalVotos} />}
          icon={<Vote className="h-4 w-4" />}
          trend={summary.participacion > 60 ? "up" : summary.participacion > 40 ? undefined : "down"}
          trendValue={`${summary.participacion.toFixed(1)}% participación`}
        />

        <StatCard
          title="Lista Nominal"
          value={<AnimatedCounter end={summary.totalListaNominal} />}
          icon={<Users className="h-4 w-4" />}
          description="Electores registrados"
        />

        <StatCard
          title="Secciones"
          value={summary.totalSecciones.toString()}
          icon={<MapPin className="h-4 w-4" />}
          description={`${summary.totalMunicipios} municipios, ${summary.totalDistritos} distritos`}
        />

        <StatCard
          title="Competitividad"
          value={summary.competitividad}
          icon={<BarChart3 className="h-4 w-4" />}
          trend={summary.margenVictoria < 10 ? "up" : undefined}
          trendValue={`${summary.margenVictoria.toFixed(1)}% margen`}
        />
      </div>

      {/* Podio de resultados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Resultados Principales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Primer lugar */}
            {summary.partidoGanador && (
              <div className="text-center p-4 border rounded-lg bg-gradient-to-b from-yellow-50 to-yellow-100 border-yellow-200">
                <div className="flex justify-center mb-2">
                  <Trophy className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="font-bold text-lg">{summary.partidoGanador.nombre}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {summary.partidoGanador.nombreCompleto}
                </p>
                <div className="text-2xl font-bold mb-1">
                  {summary.partidoGanador.votos.toLocaleString()}
                </div>
                <div className="text-lg font-semibold text-yellow-700">
                  {summary.partidoGanador.porcentaje.toFixed(2)}%
                </div>
                <Badge
                  className="mt-2"
                  style={{ backgroundColor: summary.partidoGanador.color, color: 'white' }}
                >
                  1° Lugar
                </Badge>
              </div>
            )}

            {/* Segundo lugar */}
            {summary.partidoSegundo && (
              <div className="text-center p-4 border rounded-lg bg-gradient-to-b from-gray-50 to-gray-100 border-gray-200">
                <div className="flex justify-center mb-2">
                  <Badge variant="secondary" className="h-8 w-8 rounded-full flex items-center justify-center">
                    2
                  </Badge>
                </div>
                <h3 className="font-bold text-lg">{summary.partidoSegundo.nombre}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {summary.partidoSegundo.nombreCompleto}
                </p>
                <div className="text-xl font-bold mb-1">
                  {summary.partidoSegundo.votos.toLocaleString()}
                </div>
                <div className="text-lg font-semibold text-gray-700">
                  {summary.partidoSegundo.porcentaje.toFixed(2)}%
                </div>
                <Badge
                  variant="secondary"
                  className="mt-2"
                  style={{ backgroundColor: summary.partidoSegundo.color, color: 'white' }}
                >
                  2° Lugar
                </Badge>
              </div>
            )}

            {/* Tercer lugar */}
            {summary.partidoTercero && (
              <div className="text-center p-4 border rounded-lg bg-gradient-to-b from-orange-50 to-orange-100 border-orange-200">
                <div className="flex justify-center mb-2">
                  <Badge variant="outline" className="h-8 w-8 rounded-full flex items-center justify-center">
                    3
                  </Badge>
                </div>
                <h3 className="font-bold text-lg">{summary.partidoTercero.nombre}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {summary.partidoTercero.nombreCompleto}
                </p>
                <div className="text-xl font-bold mb-1">
                  {summary.partidoTercero.votos.toLocaleString()}
                </div>
                <div className="text-lg font-semibold text-orange-700">
                  {summary.partidoTercero.porcentaje.toFixed(2)}%
                </div>
                <Badge
                  variant="outline"
                  className="mt-2"
                  style={{ backgroundColor: summary.partidoTercero.color, color: 'white' }}
                >
                  3° Lugar
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Ranking de Partidos y Coaliciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Ranking de Partidos y Coaliciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {summary.partidos.map((partido, index) => (
              <div key={partido.nombre} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant={index < 3 ? "default" : "secondary"}>
                    #{index + 1}
                  </Badge>
                  <div
                    className="w-4 h-4 rounded-full border border-white shadow-sm"
                    style={{ backgroundColor: partido.color }}
                  />
                  <div>
                    <div className="font-medium">{partido.nombre}</div>
                    <div className="text-sm text-muted-foreground">
                      {partido.nombreCompleto}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{partido.votos.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">
                    {partido.porcentaje.toFixed(2)}%
                  </div>
                </div>
                <div className="w-24">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(partido.porcentaje, 100)}%`,
                        backgroundColor: partido.color
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Análisis de competitividad */}
      {summary.municipiosCompetitivos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Municipios Competitivos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summary.municipiosCompetitivos.map((municipio, index) => (
                <div key={municipio.nombre} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{municipio.nombre}</div>
                    <div className="text-sm text-muted-foreground">
                      Ganador: {municipio.ganador} • Participación: {municipio.participacion.toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-orange-600">
                      {municipio.margen.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">margen</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Participación por secciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Secciones con mayor participación */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Mayor Participación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summary.seccionesAltas.map((seccion, index) => (
                <div key={`${seccion.seccion}-${index}`} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-medium">Sección {seccion.seccion}</div>
                    <div className="text-sm text-muted-foreground">
                      {seccion.municipio}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      {seccion.participacion.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {seccion.totalVotos}/{seccion.listaNominal}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Secciones con menor participación */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Menor Participación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summary.seccionesBajas.map((seccion, index) => (
                <div key={`${seccion.seccion}-${index}`} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-medium">Sección {seccion.seccion}</div>
                    <div className="text-sm text-muted-foreground">
                      {seccion.municipio}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-red-600">
                      {seccion.participacion.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {seccion.totalVotos}/{seccion.listaNominal}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Map, Info, Download, Palette, Trophy, Users, MapPin } from 'lucide-react'

interface SectionMapProps {
  data: any[]
}

interface SectionInfo {
  seccion: string
  municipio: string
  distrito: string
  winner: string
  winnerVotes: number
  totalVotes: number
  listaNominal: number
  parties: Record<string, number>
  winnerColor: string
  marginPercentage: number
}

// Partidos mexicanos específicos (excluyendo DISTRITO_F y DISTRITO_L)
const MEXICAN_PARTIES = [
  'PAN', 'PVEM_PT', 'PRI', 'PVEM', 'NO_REGISTRADAS', 'NULOS', 'PT', 'MC', 'PRD',
  'PAN-PRI-PRD', 'PAN-PRI', 'PAN-PRD', 'PRI-PRD', 'PVEM_PT_MORENA', 'PVEM_MORENA',
  'PT_MORENA', 'MORENA'
]

// Colores oficiales para partidos/coaliciones mexicanos
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

export function SectionMap({ data }: SectionMapProps) {
  const [selectedMetric, setSelectedMetric] = useState<string>("winner")
  const [selectedParty, setSelectedParty] = useState<string>("")
  const [colorIntensity, setColorIntensity] = useState([70])
  const [selectedSection, setSelectedSection] = useState<SectionInfo | null>(null)

  // Obtener métricas disponibles
  const availableMetrics = useMemo(() => {
    const metrics = [
      { value: "winner", label: "Partido Ganador por Sección" },
      { value: "party", label: "Votos por Partido Específico" },
      { value: "margin", label: "Margen de Victoria" },
      { value: "participation", label: "Participación Electoral" }
    ]
    return metrics
  }, [])

  // Obtener partidos disponibles
  const availableParties = useMemo(() => {
    if (!data || data.length === 0) return []

    return MEXICAN_PARTIES.filter(party => {
      return data.some(row => Number(row[party]) > 0)
    })
  }, [data])

  // Procesar datos para el mapa
  const processedMapData = useMemo(() => {
    if (!data || data.length === 0) return []

    return data.map((row, index) => {
      const seccion = row.SECCION?.toString() || index.toString()
      const municipio = row.MUNICIPIO || 'No especificado'
      const distrito = row.DISTRITO || 'No especificado'
      const listaNominal = Number(row.LISTA_NOMINAL) || 0

      // Calcular ganador por sección
      const partyResults: { party: string; votes: number }[] = []
      availableParties.forEach(party => {
        const votes = Number(row[party]) || 0
        partyResults.push({ party, votes })
      })

      partyResults.sort((a, b) => b.votes - a.votes)
      const winner = partyResults[0] || { party: 'Sin datos', votes: 0 }
      const runnerUp = partyResults[1] || { party: '', votes: 0 }
      const totalVotes = partyResults.reduce((sum, p) => sum + p.votes, 0)
      const marginPercentage = totalVotes > 0 ? ((winner.votes - runnerUp.votes) / totalVotes) * 100 : 0

      // Crear objeto de partidos para fácil acceso
      const parties: Record<string, number> = {}
      availableParties.forEach(party => {
        parties[party] = Number(row[party]) || 0
      })

      return {
        seccion,
        municipio,
        distrito,
        winner: winner.party,
        winnerVotes: winner.votes,
        totalVotes,
        listaNominal,
        parties,
        winnerColor: PARTY_COLORS[winner.party] || '#808080',
        marginPercentage,
        position: {
          left: `${10 + (index % 10) * 8}%`,
          top: `${10 + Math.floor(index / 10) * 8}%`,
          size: Math.max(20, Math.min(40, (winner.votes / 1000) * 20))
        }
      }
    }).slice(0, 100) // Limitar a 100 secciones para mejor rendimiento
  }, [data, availableParties])

  // Obtener color para una sección según la métrica seleccionada
  const getSectionColor = (section: SectionInfo) => {
    const intensity = colorIntensity[0] / 100

    switch (selectedMetric) {
      case "winner":
        return section.winnerColor
      case "party":
        if (!selectedParty) return '#e5e7eb'
        const partyVotes = section.parties[selectedParty] || 0
        const maxVotes = Math.max(...Object.values(section.parties))
        const alpha = maxVotes > 0 ? (partyVotes / maxVotes) * intensity : 0.1
        const baseColor = PARTY_COLORS[selectedParty] || '#6b7280'
        return `${baseColor}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`
      case "margin":
        const marginIntensity = Math.min(1, section.marginPercentage / 50) * intensity
        return `rgba(34, 197, 94, ${marginIntensity})`
      case "participation":
        const participation = section.listaNominal > 0 ? section.totalVotes / section.listaNominal : 0
        const participationIntensity = Math.min(1, participation) * intensity
        return `rgba(59, 130, 246, ${participationIntensity})`
      default:
        return '#e5e7eb'
    }
  }

  // Estadísticas del mapa
  const mapStats = useMemo(() => {
    if (!processedMapData.length) return null

    const totalSections = processedMapData.length
    const totalVotes = processedMapData.reduce((sum, s) => sum + s.totalVotes, 0)
    const totalListaNominal = processedMapData.reduce((sum, s) => sum + s.listaNominal, 0)
    const avgParticipation = totalListaNominal > 0 ? (totalVotes / totalListaNominal) * 100 : 0

    // Contar victorias por partido
    const partyWins: Record<string, number> = {}
    processedMapData.forEach(section => {
      partyWins[section.winner] = (partyWins[section.winner] || 0) + 1
    })

    const topParties = Object.entries(partyWins)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)

    return {
      totalSections,
      totalVotes,
      totalListaNominal,
      avgParticipation,
      partyWins,
      topParties
    }
  }, [processedMapData])

  const MapVisualization = () => {
    if (!processedMapData.length) {
      return (
        <div className="h-96 bg-muted/20 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Map className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay datos para visualizar</p>
          </div>
        </div>
      )
    }

    return (
      <div className="relative h-96 bg-slate-50 rounded-lg overflow-hidden border">
        {/* Grid de fondo */}
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={`grid-h-${i}`}
              className="absolute w-full h-px bg-gray-400"
              style={{ top: `${i * 10}%` }}
            />
          ))}
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={`grid-v-${i}`}
              className="absolute h-full w-px bg-gray-400"
              style={{ left: `${i * 10}%` }}
            />
          ))}
        </div>

        {/* Secciones */}
        {processedMapData.map((section, index) => (
          <div
            key={section.seccion}
            className="absolute rounded-md border border-white/60 cursor-pointer transition-all hover:scale-110 hover:z-20 hover:shadow-lg"
            style={{
              left: section.position.left,
              top: section.position.top,
              width: `${section.position.size}px`,
              height: `${section.position.size}px`,
              backgroundColor: getSectionColor(section),
            }}
            onClick={() => setSelectedSection(section)}
            title={`Sección ${section.seccion} - ${section.winner}: ${section.winnerVotes.toLocaleString()} votos`}
          >
            <div className="h-full w-full flex items-center justify-center">
              <span className="text-xs text-white font-medium opacity-80">
                {section.seccion}
              </span>
            </div>
          </div>
        ))}

        {/* Leyenda */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm max-w-xs">
          <h4 className="font-medium text-xs mb-2">Leyenda</h4>
          {selectedMetric === "winner" && mapStats && (
            <div className="space-y-1">
              {mapStats.topParties.slice(0, 4).map(([party, wins]) => (
                <div key={party} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: PARTY_COLORS[party] || '#808080' }}
                  />
                  <span className="text-xs">{party}: {wins}</span>
                </div>
              ))}
            </div>
          )}
          {selectedMetric === "party" && selectedParty && (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: PARTY_COLORS[selectedParty] || '#808080' }}
                />
                <span className="text-xs">{selectedParty}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Intensidad = Votos relativos
              </div>
            </div>
          )}
        </div>

        {/* Información general */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm">
          <div className="text-xs">
            <div className="font-medium">{processedMapData.length} secciones</div>
            <div className="text-muted-foreground">
              {mapStats?.totalVotes.toLocaleString()} votos totales
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5" />
            Mapa Electoral por Secciones
          </CardTitle>
          <CardDescription>
            Visualiza los resultados electorales geográficamente con colores oficiales por partido ganador
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Controles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Tipo de visualización:</label>
                <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar métrica" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMetrics.map((metric) => (
                      <SelectItem key={metric.value} value={metric.value}>
                        {metric.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedMetric === "party" && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Partido específico:</label>
                  <Select value={selectedParty} onValueChange={setSelectedParty}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar partido" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableParties.map((party) => (
                        <SelectItem key={party} value={party}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded"
                              style={{ backgroundColor: PARTY_COLORS[party] || '#808080' }}
                            />
                            {party}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Intensidad: {colorIntensity[0]}%
                </label>
                <Slider
                  value={colorIntensity}
                  onValueChange={setColorIntensity}
                  max={100}
                  min={10}
                  step={10}
                  className="w-full"
                />
              </div>
            </div>

            {/* Estadísticas generales */}
            {mapStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-3">
                    <div className="text-lg font-bold">{mapStats.totalSections}</div>
                    <div className="text-sm text-muted-foreground">Secciones</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3">
                    <div className="text-lg font-bold">{mapStats.totalVotes.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Votos totales</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3">
                    <div className="text-lg font-bold">{mapStats.avgParticipation.toFixed(1)}%</div>
                    <div className="text-sm text-muted-foreground">Participación promedio</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3">
                    <div className="text-lg font-bold">{mapStats.topParties[0]?.[0] || 'N/A'}</div>
                    <div className="text-sm text-muted-foreground">Partido líder</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Visualización del mapa */}
            <MapVisualization />

            {/* Información adicional */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Haz clic en cualquier sección del mapa para ver información detallada.
                Los colores representan el partido ganador en cada sección electoral con colores oficiales.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Ranking de partidos */}
      {mapStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Ranking de Partidos por Secciones Ganadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mapStats.topParties.map(([party, wins], index) => (
                <div key={party} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: PARTY_COLORS[party] || '#808080' }}
                    />
                    <div>
                      <span className="font-medium">{party}</span>
                      <div className="text-sm text-muted-foreground">
                        {PARTY_NAMES[party] || party}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{wins} secciones</div>
                    <div className="text-sm text-muted-foreground">
                      {((wins / mapStats.totalSections) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de información de sección */}
      <Dialog open={!!selectedSection} onOpenChange={() => setSelectedSection(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Sección {selectedSection?.seccion}
            </DialogTitle>
          </DialogHeader>
          {selectedSection && (
            <div className="space-y-4">
              {/* Información general */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Municipio:</span>
                  <div className="font-medium">{selectedSection.municipio}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Distrito:</span>
                  <div className="font-medium">{selectedSection.distrito}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Lista nominal:</span>
                  <div className="font-medium">{selectedSection.listaNominal.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Total votos:</span>
                  <div className="font-medium">{selectedSection.totalVotes.toLocaleString()}</div>
                </div>
              </div>

              {/* Ganador */}
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">Partido Ganador</span>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: selectedSection.winnerColor }}
                  />
                  <div>
                    <div className="font-bold">{selectedSection.winner}</div>
                    <div className="text-sm text-muted-foreground">
                      {PARTY_NAMES[selectedSection.winner] || selectedSection.winner}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {selectedSection.winnerVotes.toLocaleString()} votos
                      ({((selectedSection.winnerVotes / selectedSection.totalVotes) * 100).toFixed(1)}%)
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Margen de victoria: {selectedSection.marginPercentage.toFixed(1)}%
                </div>
              </div>

              {/* Resultados por partido */}
              <div>
                <h4 className="font-medium mb-2">Resultados por partido:</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {Object.entries(selectedSection.parties)
                    .sort(([, a], [, b]) => b - a)
                    .map(([party, votes]) => (
                      <div key={party} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: PARTY_COLORS[party] || '#808080' }}
                          />
                          <span>{party}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{votes.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">
                            {selectedSection.totalVotes > 0 ? ((votes / selectedSection.totalVotes) * 100).toFixed(1) : 0}%
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Participación */}
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Participación Electoral</span>
                </div>
                <div className="text-2xl font-bold text-blue-800">
                  {selectedSection.listaNominal > 0
                    ? ((selectedSection.totalVotes / selectedSection.listaNominal) * 100).toFixed(1)
                    : 0}%
                </div>
                <div className="text-sm text-blue-600">
                  {selectedSection.totalVotes.toLocaleString()} de {selectedSection.listaNominal.toLocaleString()} votantes
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

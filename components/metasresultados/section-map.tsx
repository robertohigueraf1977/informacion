"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { CardSpotlight } from "@/components/ui/card-spotlight"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"

interface SectionMapProps {
  data: any[]
}

export function SectionMap({ data }: SectionMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [selectedParty, setSelectedParty] = useState<string | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [colorScale, setColorScale] = useState<"linear" | "quantile">("linear")
  const [opacity, setOpacity] = useState(0.7)
  const [zoom, setZoom] = useState(1)
  const [mapView, setMapView] = useState<"standard" | "heatmap" | "districts">("standard")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mapData, setMapData] = useState<any[]>([])
  const { toast } = useToast()

  // Obtener partidos políticos (excluyendo columnas no relacionadas)
  const parties = useMemo(() => {
    if (!data || data.length === 0) return []

    return Object.keys(data[0] || {}).filter(
      (col) =>
        col !== "SECCION" &&
        col !== "DISTRITO" &&
        col !== "MUNICIPIO" &&
        col !== "LOCALIDAD" &&
        col !== "LISTA_NOMINAL",
    )
  }, [data])

  // Definir la paleta de colores
  const partyColors: Record<string, string> = {
    PAN: "#1e40af", // azul oscuro
    PRI: "#dc2626", // rojo
    PRD: "#f59e0b", // amarillo
    PVEM: "#15803d", // verde
    PT: "#b91c1c", // rojo oscuro
    MC: "#ea580c", // naranja
    MORENA: "#7e22ce", // morado
    "PAN-PRI-PRD": "#6366f1", // indigo
    PVEM_PT_MORENA: "#a855f7", // púrpura
    NO_REGISTRADAS: "#374151", // gris oscuro
    NULOS: "#1f2937", // casi negro
  }

  // Procesar datos para el mapa
  useEffect(() => {
    if (!data || data.length === 0) {
      setError("No hay datos disponibles para visualizar en el mapa")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Agrupar datos por sección
      const sectionMap = new Map()

      data.forEach((row) => {
        const section = row.SECCION
        if (!section) return

        if (!sectionMap.has(section)) {
          sectionMap.set(section, {
            section,
            district: row.DISTRITO || "N/A",
            municipality: row.MUNICIPIO || "N/A",
            listaNominal: Number(row.LISTA_NOMINAL) || 0,
            parties: {},
          })
        }

        // Agregar votos por partido
        parties.forEach((party) => {
          if (row[party] && !isNaN(Number(row[party]))) {
            const sectionData = sectionMap.get(section)
            sectionData.parties[party] = (sectionData.parties[party] || 0) + Number(row[party])
          }
        })
      })

      // Convertir a array y calcular totales y porcentajes
      const processedData = Array.from(sectionMap.values()).map((section) => {
        const totalVotes = Object.values(section.parties).reduce((sum: number, votes: any) => sum + votes, 0)

        // Calcular porcentajes
        const partyPercentages: Record<string, number> = {}
        Object.entries(section.parties).forEach(([party, votes]) => {
          partyPercentages[party] = totalVotes > 0 ? (Number(votes) / totalVotes) * 100 : 0
        })

        // Encontrar partido ganador
        let winningParty = null
        let maxVotes = -1

        Object.entries(section.parties).forEach(([party, votes]) => {
          if (Number(votes) > maxVotes) {
            maxVotes = Number(votes)
            winningParty = party
          }
        })

        return {
          ...section,
          totalVotes,
          partyPercentages,
          winningParty,
          maxVotes,
        }
      })

      setMapData(processedData)
      setLoading(false)

      // Auto-seleccionar el primer partido para mejor UX
      if (parties.length > 0 && !selectedParty) {
        setSelectedParty(parties[0])
      }

      // Simular carga del mapa
      setTimeout(() => {
        setMapLoaded(true)
      }, 1500)
    } catch (err) {
      console.error("Error al procesar datos para el mapa:", err)
      setError("Error al procesar los datos para la visualización del mapa")
      setLoading(false)
    }
  }, [data, parties, selectedParty])

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.2, 2))
  }

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.2, 0.5))
  }

  const getSelectedPartyColor = () => {
    return selectedParty ? partyColors[selectedParty] || "#6b7280" : "#e5e7eb"
  }

  const handleExportMap = () => {
    if (!mapLoaded) {
      toast({
        title: "El mapa aún no está listo",
        description: "Espera a que el mapa termine de cargar para exportarlo",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Exportación de mapa",
      description: "La funcionalidad de exportación estará disponible en una próxima actualización",
    })
  }

  const handleRefreshMap = () => {
    setMapLoaded(false)
    setLoading(true)

    // Simular recarga del mapa
    setTimeout(() => {
      setMapLoaded(true)
      setLoading(false)

      toast({
        title: "Mapa actualizado",
        description: "Los datos del mapa han sido actualizados correctamente",
      })
    }, 1500)
  }

  // Calcular estadísticas del partido seleccionado
  const partyStats = useMemo(() => {
    if (!selectedParty || mapData.length === 0) return null

    const totalVotes = mapData.reduce((sum, section) => sum + (section.parties[selectedParty] || 0), 0)
    const totalSections = mapData.length
    const sectionsWithVotes = mapData.filter((section) => (section.parties[selectedParty] || 0) > 0).length
    const maxVotesSection = mapData.reduce(
      (max, section) => {
        const votes = section.parties[selectedParty] || 0
        return votes > max.votes ? { section: section.section, votes } : max
      },
      { section: "", votes: 0 },
    )

    const avgVotesPerSection = totalSections > 0 ? totalVotes / totalSections : 0

    return {
      totalVotes,
      totalSections,
      sectionsWithVotes,
      maxVotesSection,
      avgVotesPerSection,
      percentageSectionsWithVotes: totalSections > 0 ? (sectionsWithVotes / totalSections) * 100 : 0,
    }
  }, [selectedParty, mapData])

  // Generar secciones para el mapa simulado
  const generateMapSections = () => {
    if (!mapData || mapData.length === 0) return []

    // Usar datos reales para generar secciones simuladas
    // En una implementación real, usaríamos coordenadas geográficas reales
    return mapData.slice(0, 30).map((section, index) => {
      const partyVotes = section.parties[selectedParty || ""] || 0
      const maxPossibleVotes = section.listaNominal || 100
      const votePercentage = maxPossibleVotes > 0 ? (partyVotes / maxPossibleVotes) * 100 : 0

      // Calcular opacidad basada en porcentaje de votos
      let sectionOpacity
      if (colorScale === "linear") {
        sectionOpacity = (votePercentage / 100) * opacity + 0.2
      } else {
        // Escala por cuantiles
        if (votePercentage < 10) sectionOpacity = 0.2 * opacity
        else if (votePercentage < 25) sectionOpacity = 0.4 * opacity
        else if (votePercentage < 50) sectionOpacity = 0.6 * opacity
        else if (votePercentage < 75) sectionOpacity = 0.8 * opacity
        else sectionOpacity = opacity
      }

      return {
        id: section.section,
        district: section.district,
        municipality: section.municipality,
        votes: partyVotes,
        percentage: votePercentage,
        opacity: sectionOpacity,
        // Posición simulada
        position: {
          left: `${Math.random() * 80 + 10}%`,
          top: `${Math.random() * 80 + 10}%`,
          width: `${Math.random() * 10 + 5}%`,
          height: `${Math.random() * 10 + 5}%`,
          rotation: Math.random() * 20 - 10,
        },
      }
    })
  }

  const mapSections = useMemo(() => generateMapSections(), [mapData, selectedParty, colorScale, opacity])

  // Generar distritos simulados
  const districts = useMemo(() => {
    if (!mapData || mapData.length === 0) return []

    const uniqueDistricts = [...new Set(mapData.map((section) => section.district))]
      .filter((district) => district !== "N/A")
      .slice(0, 5)

    return uniqueDistricts.map((district) => ({
      id: district,
      name: `Distrito ${district}`,
      position: {
        left: `${Math.random() * 80 + 10}%`,
        top: `${Math.random() * 80 + 10}%`,
      },
    }))
  }, [mapData])

  if (error) {
    return (
      <CardSpotlight className="h-full w-full">
        <CardHeader>
          <CardTitle>Mapa de Secciones Electorales</CardTitle>
          <CardDescription>Visualización geográfica de resultados electorales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-destructive/60"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h3 className="font-medium text-lg mb-2">{error}</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              Verifica que los datos contengan información de secciones electorales y resultados por partido.
            </p>
          </div>
        </CardContent>
      </CardSpotlight>
    )
  }

  return (
    <CardSpotlight className="h-full w-full">
      <CardHeader>
        <CardTitle>Mapa de Secciones Electorales</CardTitle>
        <CardDescription>Visualización geográfica de resultados electorales</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="map" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="map"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Mapa
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Estadísticas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="space-y-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2">
                <Label>Partido/Coalición</Label>
                <Select value={selectedParty || ""} onValueChange={setSelectedParty}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Seleccionar partido" />
                  </SelectTrigger>
                  <SelectContent>
                    {parties.map((party) => (
                      <SelectItem key={party} value={party}>
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: partyColors[party] || "#6b7280" }}
                          />
                          {party}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Vista del Mapa</Label>
                <Select
                  value={mapView}
                  onValueChange={(value: "standard" | "heatmap" | "districts") => setMapView(value)}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Tipo de vista" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Estándar</SelectItem>
                    <SelectItem value="heatmap">Mapa de calor</SelectItem>
                    <SelectItem value="districts">Por distritos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Escala de Color</Label>
                <Select value={colorScale} onValueChange={(value: "linear" | "quantile") => setColorScale(value)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Tipo de escala" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="linear">Lineal</SelectItem>
                    <SelectItem value="quantile">Cuantiles</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 flex-1 min-w-[200px]">
                <Label>Opacidad: {(opacity * 100).toFixed(0)}%</Label>
                <Slider
                  value={[opacity * 100]}
                  min={10}
                  max={100}
                  step={5}
                  onValueChange={(value) => setOpacity(value[0] / 100)}
                />
              </div>
            </div>

            <div className="relative rounded-lg overflow-hidden border" style={{ height: "500px" }}>
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
                  <div className="text-center">
                    <Skeleton className="h-12 w-12 rounded-full mx-auto" />
                    <Skeleton className="h-4 w-32 mx-auto mt-4" />
                  </div>
                </div>
              ) : !mapLoaded ? (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
                  <div className="text-center animate-pulse">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mx-auto text-primary/60"
                    >
                      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                      <line x1="9" y1="3" x2="9" y2="18" />
                      <line x1="15" y1="6" x2="15" y2="21" />
                    </svg>
                    <p className="mt-2">Cargando mapa...</p>
                    <Progress value={60} className="w-48 h-2 mx-auto mt-4" />
                  </div>
                </div>
              ) : (
                <>
                  <div
                    ref={mapContainerRef}
                    className="absolute inset-0 bg-slate-100 flex items-center justify-center"
                    style={{
                      transform: `scale(${zoom})`,
                      transition: "transform 0.3s ease",
                    }}
                  >
                    {/* Simulación de un mapa con secciones */}
                    <div className="relative w-full h-full">
                      {/* Fondo del mapa */}
                      <div className="absolute inset-0 bg-slate-100 opacity-50">
                        {/* Líneas de cuadrícula simuladas */}
                        {[...Array(10)].map((_, i) => (
                          <div
                            key={`grid-h-${i}`}
                            className="absolute w-full h-px bg-slate-300"
                            style={{ top: `${i * 10}%` }}
                          />
                        ))}
                        {[...Array(10)].map((_, i) => (
                          <div
                            key={`grid-v-${i}`}
                            className="absolute h-full w-px bg-slate-300"
                            style={{ left: `${i * 10}%` }}
                          />
                        ))}
                      </div>

                      {/* Secciones del mapa */}
                      {mapSections.map((section) => (
                        <TooltipProvider key={`section-${section.id}`}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className="absolute rounded-md border border-white/40 cursor-pointer transition-all hover:brightness-110 hover:border-white"
                                style={{
                                  left: section.position.left,
                                  top: section.position.top,
                                  width: section.position.width,
                                  height: section.position.height,
                                  backgroundColor: getSelectedPartyColor(),
                                  opacity: section.opacity,
                                  transform: `rotate(${section.position.rotation}deg)`,
                                }}
                              >
                                <div className="h-full w-full flex items-center justify-center">
                                  <div className="text-xs text-white font-medium opacity-80">{section.id}</div>
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="space-y-1">
                                <div className="font-medium">Sección {section.id}</div>
                                <div className="text-xs">
                                  <span className="font-medium">{selectedParty}:</span> {section.votes.toLocaleString()}{" "}
                                  votos
                                </div>
                                <div className="text-xs">Porcentaje: {section.percentage.toFixed(1)}%</div>
                                <div className="text-xs">Distrito: {section.district}</div>
                                <div className="text-xs">Municipio: {section.municipality}</div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}

                      {/* Marcadores de distritos */}
                      {mapView === "districts" &&
                        districts.map((district) => (
                          <div
                            key={`district-${district.id}`}
                            className="absolute flex flex-col items-center animate-bounce"
                            style={{
                              left: district.position.left,
                              top: district.position.top,
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-primary"
                            >
                              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                            <div className="text-xs bg-background p-1 rounded shadow">{district.name}</div>
                          </div>
                        ))}

                      {/* Mensaje central */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        {selectedParty ? (
                          <div className="text-center">
                            <div className="text-4xl font-bold text-white/10">{selectedParty}</div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center p-4 bg-white/80 rounded-lg shadow-lg">
                            <p className="text-center">
                              Selecciona un partido para visualizar su distribución en el mapa
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Controles del mapa */}
                  <div className="absolute top-2 right-2 flex flex-col gap-2">
                    <Button variant="outline" size="icon" className="bg-white/80" onClick={handleZoomIn}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        <line x1="11" y1="8" x2="11" y2="14" />
                        <line x1="8" y1="11" x2="14" y2="11" />
                      </svg>
                    </Button>
                    <Button variant="outline" size="icon" className="bg-white/80" onClick={handleZoomOut}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        <line x1="8" y1="11" x2="14" y2="11" />
                      </svg>
                    </Button>
                    <Button variant="outline" size="icon" className="bg-white/80">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <rect x="7" y="7" width="3" height="9" />
                        <rect x="14" y="7" width="3" height="5" />
                      </svg>
                    </Button>
                    <Button variant="outline" size="icon" className="bg-white/80" onClick={handleRefreshMap}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                      </svg>
                    </Button>
                  </div>

                  <div className="absolute bottom-2 right-2">
                    <Button variant="outline" className="bg-white/80" onClick={handleExportMap}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      Exportar Mapa
                    </Button>
                  </div>

                  {/* Leyenda */}
                  <div className="absolute bottom-2 left-2 bg-white/80 p-2 rounded border">
                    <div className="text-xs font-medium mb-1">Leyenda</div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getSelectedPartyColor(), opacity: 0.8 }}
                        />
                        <span className="text-xs">Alta concentración</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getSelectedPartyColor(), opacity: 0.5 }}
                        />
                        <span className="text-xs">Media concentración</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getSelectedPartyColor(), opacity: 0.2 }}
                        />
                        <span className="text-xs">Baja concentración</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="stats">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-1/3" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Skeleton className="h-32" />
                  <Skeleton className="h-32" />
                  <Skeleton className="h-32" />
                  <Skeleton className="h-32" />
                  <Skeleton className="h-32" />
                </div>
                <Skeleton className="h-64" />
              </div>
            ) : !selectedParty ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary/60"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                  </svg>
                </div>
                <h3 className="font-medium text-lg mb-2">Selecciona un partido para ver estadísticas</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-md">
                  Las estadísticas te mostrarán información detallada sobre la distribución de votos por sección
                  electoral.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Estadísticas para {selectedParty}</h3>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    {mapData.length} secciones analizadas
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <CardSpotlight containerClassName="h-full">
                    <div className="p-4 h-full">
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getSelectedPartyColor() }}
                        ></div>
                        <h3 className="font-medium">Total de Votos</h3>
                      </div>
                      <p className="text-2xl font-bold">{partyStats?.totalVotes.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        En {partyStats?.sectionsWithVotes} secciones electorales
                      </p>
                    </div>
                  </CardSpotlight>

                  <CardSpotlight containerClassName="h-full">
                    <div className="p-4 h-full">
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getSelectedPartyColor() }}
                        ></div>
                        <h3 className="font-medium">Promedio por Sección</h3>
                      </div>
                      <p className="text-2xl font-bold">{partyStats?.avgVotesPerSection.toFixed(1)}</p>
                      <p className="text-sm text-muted-foreground mt-1">Votos promedio por sección</p>
                    </div>
                  </CardSpotlight>

                  <CardSpotlight containerClassName="h-full">
                    <div className="p-4 h-full">
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getSelectedPartyColor() }}
                        ></div>
                        <h3 className="font-medium">Sección con más Votos</h3>
                      </div>
                      <p className="text-2xl font-bold">{partyStats?.maxVotesSection.section}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {partyStats?.maxVotesSection.votes.toLocaleString()} votos
                      </p>
                    </div>
                  </CardSpotlight>
                </div>

                <CardSpotlight>
                  <div className="p-4">
                    <h3 className="font-medium mb-4">Cobertura en Secciones</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Secciones con votos para {selectedParty}</span>
                        <span>{partyStats?.percentageSectionsWithVotes.toFixed(1)}%</span>
                      </div>
                      <Progress
                        value={partyStats?.percentageSectionsWithVotes}
                        className="h-2"
                        indicatorClassName="bg-primary"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        {partyStats?.sectionsWithVotes} de {partyStats?.totalSections} secciones tienen votos
                        registrados para este partido
                      </p>
                    </div>

                    <div className="mt-6 pt-6 border-t">
                      <h4 className="font-medium mb-2">Distribución de Votos</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Esta visualización muestra cómo se distribuyen los votos del partido en las diferentes secciones
                        electorales.
                      </p>

                      {/* Visualización simplificada de distribución */}
                      <div className="h-32 flex items-end gap-1">
                        {[...Array(20)].map((_, i) => {
                          const height = Math.random() * 80 + 20
                          return (
                            <div
                              key={`bar-${i}`}
                              className="flex-1 rounded-t transition-all hover:opacity-80"
                              style={{
                                height: `${height}%`,
                                backgroundColor: getSelectedPartyColor(),
                                opacity: 0.2 + (height / 100) * 0.8,
                              }}
                            />
                          )
                        })}
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Secciones con menos votos</span>
                        <span>Secciones con más votos</span>
                      </div>
                    </div>
                  </div>
                </CardSpotlight>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-between text-sm text-muted-foreground">
          <div>
            Nota: Para una implementación completa, se requiere integración con datos geográficos de secciones
            electorales.
          </div>
        </div>
      </CardContent>
    </CardSpotlight>
  )
}

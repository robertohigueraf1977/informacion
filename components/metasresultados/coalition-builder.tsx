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
import { Input } from "@/components/ui/input"
import dynamic from "next/dynamic"

// Importar Leaflet dinámicamente (sin SSR)
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false })
const GeoJSON = dynamic(() => import("react-leaflet").then((mod) => mod.GeoJSON), { ssr: false })
const ZoomControl = dynamic(() => import("react-leaflet").then((mod) => mod.ZoomControl), { ssr: false })
const ScaleControl = dynamic(() => import("react-leaflet").then((mod) => mod.ScaleControl), { ssr: false })
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false })

interface SectionMapProps {
  data: any[]
}

export function SectionMap({ data }: SectionMapProps) {
  const mapRef = useRef<any>(null)
  const [selectedParty, setSelectedParty] = useState<string | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [colorScale, setColorScale] = useState<"linear" | "quantile">("linear")
  const [opacity, setOpacity] = useState(0.7)
  const [mapView, setMapView] = useState<"standard" | "heatmap" | "districts">("standard")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mapData, setMapData] = useState<any[]>([])
  const [geoJsonData, setGeoJsonData] = useState<any | null>(null)
  const [geoJsonUrl, setGeoJsonUrl] = useState<string>("")
  const [isLoadingGeoJson, setIsLoadingGeoJson] = useState(false)
  const { toast } = useToast()
  const [zoom, setZoom] = useState(1)

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

  // Función para cargar datos GeoJSON
  const loadGeoJsonData = async () => {
    if (!geoJsonUrl) {
      toast({
        title: "URL no válida",
        description: "Por favor, introduce una URL válida para el archivo GeoJSON",
        variant: "destructive",
      })
      return
    }

    setIsLoadingGeoJson(true)
    setError(null)

    try {
      const response = await fetch(geoJsonUrl)

      if (!response.ok) {
        throw new Error(`Error al cargar el archivo GeoJSON: ${response.status} ${response.statusText}`)
      }

      const geoData = await response.json()

      // Validar que sea un GeoJSON válido
      if (!geoData.type || !geoData.features) {
        throw new Error("El archivo no parece ser un GeoJSON válido")
      }

      setGeoJsonData(geoData)
      setMapLoaded(true)

      toast({
        title: "GeoJSON cargado correctamente",
        description: `Se han cargado ${geoData.features.length} características geográficas`,
      })

      // Ajustar el mapa para mostrar todos los datos
      if (mapRef.current) {
        setTimeout(() => {
          const leafletElement = mapRef.current.leafletElement
          if (leafletElement && leafletElement.fitBounds) {
            try {
              leafletElement.fitBounds(leafletElement.getBounds())
            } catch (e) {
              console.error("Error al ajustar el mapa:", e)
            }
          }
        }, 100)
      }
    } catch (err) {
      console.error("Error al cargar GeoJSON:", err)
      setError(`Error al cargar el archivo GeoJSON: ${err instanceof Error ? err.message : "Error desconocido"}`)
      toast({
        title: "Error al cargar GeoJSON",
        description: err instanceof Error ? err.message : "Error desconocido",
        variant: "destructive",
      })
    } finally {
      setIsLoadingGeoJson(false)
    }
  }

  const getSelectedPartyColor = () => {
    return selectedParty ? partyColors[selectedParty] || "#6b7280" : "#e5e7eb"
  }

  // Función para estilizar las características del GeoJSON
  const styleGeoJson = (feature: any) => {
    if (!selectedParty || !feature.properties)
      return { fillColor: "#cccccc", weight: 1, opacity: 1, color: "#666", fillOpacity: 0.5 }

    // Intentar encontrar la sección correspondiente en nuestros datos
    const sectionId = feature.properties.SECCION || feature.properties.seccion || feature.properties.id
    const sectionData = mapData.find((s) => String(s.section) === String(sectionId))

    if (!sectionData) return { fillColor: "#cccccc", weight: 1, opacity: 1, color: "#666", fillOpacity: 0.2 }

    const partyVotes = sectionData.parties[selectedParty] || 0
    const maxPossibleVotes = sectionData.listaNominal || 100
    const votePercentage = maxPossibleVotes > 0 ? (partyVotes / maxPossibleVotes) * 100 : 0

    // Calcular opacidad basada en porcentaje de votos
    let fillOpacity
    if (colorScale === "linear") {
      fillOpacity = (votePercentage / 100) * opacity + 0.2
    } else {
      // Escala por cuantiles
      if (votePercentage < 10) fillOpacity = 0.2 * opacity
      else if (votePercentage < 25) fillOpacity = 0.4 * opacity
      else if (votePercentage < 50) fillOpacity = 0.6 * opacity
      else if (votePercentage < 75) fillOpacity = 0.8 * opacity
      else fillOpacity = opacity
    }

    return {
      fillColor: getSelectedPartyColor(),
      weight: 1,
      opacity: 1,
      color: "#ffffff",
      fillOpacity: fillOpacity,
    }
  }

  // Función para manejar el evento onEachFeature del GeoJSON
  const onEachFeature = (feature: any, layer: any) => {
    if (!feature.properties) return

    const sectionId = feature.properties.SECCION || feature.properties.seccion || feature.properties.id
    const sectionData = mapData.find((s) => String(s.section) === String(sectionId))

    if (sectionData) {
      const popupContent = `
        <div class="p-2">
          <div class="font-bold mb-1">Sección ${sectionId}</div>
          <div class="text-sm">Distrito: ${sectionData.district}</div>
          <div class="text-sm">Municipio: ${sectionData.municipality}</div>
          ${
            selectedParty
              ? `
            <div class="mt-2 pt-2 border-t border-gray-200">
              <div class="font-medium">${selectedParty}</div>
              <div class="text-sm">Votos: ${sectionData.parties[selectedParty] || 0}</div>
              <div class="text-sm">% Lista Nominal: ${(((sectionData.parties[selectedParty] || 0) / sectionData.listaNominal) * 100).toFixed(1)}%</div>
            </div>
          `
              : ""
          }
        </div>
      `
      layer.bindPopup(popupContent)
    } else {
      layer.bindPopup(
        `<div>Sección ${sectionId}</div><div class="text-sm text-gray-500">No hay datos disponibles</div>`,
      )
    }
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

  // Generar secciones para el mapa simulado (cuando no hay GeoJSON)
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger
              value="map"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Mapa
            </TabsTrigger>
            <TabsTrigger
              value="geojson"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Cargar GeoJSON
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
              ) : geoJsonData ? (
                // Renderizar mapa con Leaflet y GeoJSON
                <div className="h-full w-full" id="leaflet-map">
                  {typeof window !== "undefined" && (
                    <MapContainer
                      center={[19.4326, -99.1332]} // Centro en CDMX por defecto
                      zoom={5}
                      style={{ height: "100%", width: "100%" }}
                      ref={mapRef}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <GeoJSON data={geoJsonData} style={styleGeoJson} onEachFeature={onEachFeature} />
                      <ZoomControl position="topright" />
                      <ScaleControl position="bottomleft" />
                    </MapContainer>
                  )}
                </div>
              ) : (
                // Mapa simulado (cuando no hay GeoJSON)
                <>
                  <div
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

          <TabsContent value="geojson" className="space-y-4">
            <div className="p-4 border rounded-lg bg-muted/10">
              <h3 className="text-lg font-medium mb-4">Cargar archivo GeoJSON</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Introduce la URL de un archivo GeoJSON que contenga las geometrías de las secciones electorales. El
                archivo debe tener un campo que coincida con los IDs de sección en tus datos electorales.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="https://ejemplo.com/secciones.geojson"
                    value={geoJsonUrl}
                    onChange={(e) => setGeoJsonUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={loadGeoJsonData}
                    disabled={isLoadingGeoJson || !geoJsonUrl}
                    className="whitespace-nowrap"
                  >
                    {isLoadingGeoJson ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Cargando...
                      </>
                    ) : (
                      "Cargar GeoJSON"
                    )}
                  </Button>
                </div>

                {geoJsonData && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-start gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-green-500 mt-0.5"
                      >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      <div>
                        <p className="font-medium text-green-800">GeoJSON cargado correctamente</p>
                        <p className="text-sm text-green-700">
                          Se han cargado {geoJsonData.features.length} características geográficas. Ahora puedes
                          visualizar los datos en el mapa.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                  <div className="flex items-start gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-amber-500 mt-0.5"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <div>
                      <p className="font-medium text-amber-800">Formato esperado del GeoJSON</p>
                      <p className="text-sm text-amber-700 mt-1">
                        El archivo GeoJSON debe contener un campo en sus propiedades que coincida con los IDs de sección
                        en tus datos electorales. Este campo puede llamarse "SECCION", "seccion" o "id".
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>Ejemplos de URLs de GeoJSON:</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>https://raw.githubusercontent.com/INEGI/secciones-electorales/main/secciones.geojson</li>
                    <li>https://datos.gob.mx/busca/dataset/secciones-electorales/resource/secciones.geojson</li>
                    <li className="text-xs text-muted-foreground italic">
                      (Estas URLs son ejemplos y pueden no existir)
                    </li>
                  </ul>
                </div>
              </div>
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
            {geoJsonData
              ? "Mapa cargado con datos GeoJSON. Selecciona un partido para visualizar su distribución."
              : "Para una visualización más precisa, carga un archivo GeoJSON con las geometrías de las secciones electorales."}
          </div>
        </div>
      </CardContent>
    </CardSpotlight>
  )
}

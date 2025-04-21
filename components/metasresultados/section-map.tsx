"use client"

import { useState, useEffect, useRef } from "react"
import { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Download, Map, ZoomIn, ZoomOut, Layers, MapPin } from "lucide-react"
import { CardSpotlight } from "@/components/ui/card-spotlight"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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

  // Obtener partidos políticos (excluyendo columnas no relacionadas)
  const parties = Object.keys(data[0] || {}).filter(
    (col) =>
      col !== "SECCION" && col !== "DISTRITO" && col !== "MUNICIPIO" && col !== "LOCALIDAD" && col !== "LISTA_NOMINAL",
  )

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

  // Simular la carga del mapa (en una implementación real, aquí se cargaría un mapa real)
  useEffect(() => {
    const timer = setTimeout(() => {
      setMapLoaded(true)
      setSelectedParty("MORENA") // Auto-seleccionar el primer partido para mejor UX
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.2, 2))
  }

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.2, 0.5))
  }

  const getSelectedPartyColor = () => {
    return selectedParty ? partyColors[selectedParty] || "#6b7280" : "#e5e7eb"
  }

  // En una implementación real, aquí se renderizaría un mapa con Leaflet o similar
  // Para este ejemplo, mostraremos un placeholder

  return (
    <CardSpotlight className="h-full w-full">
      <CardHeader>
        <CardTitle>Mapa de Secciones Electorales</CardTitle>
        <CardDescription>Visualización geográfica de resultados electorales</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
          {!mapLoaded ? (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
              <div className="text-center animate-pulse">
                <Map className="h-12 w-12 mx-auto text-primary/60" />
                <p className="mt-2">Cargando mapa...</p>
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
                  {/* Secciones de ejemplo (en implementación real, estas serían generadas dinámicamente) */}
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute rounded-md border border-white/40"
                      style={{
                        left: `${Math.random() * 80 + 10}%`,
                        top: `${Math.random() * 80 + 10}%`,
                        width: `${Math.random() * 10 + 5}%`,
                        height: `${Math.random() * 10 + 5}%`,
                        backgroundColor: getSelectedPartyColor(),
                        opacity: Math.random() * 0.5 + opacity * 0.5,
                        transform: `rotate(${Math.random() * 20 - 10}deg)`,
                      }}
                    >
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="h-full w-full cursor-pointer flex items-center justify-center">
                              <div className="text-xs text-white font-medium opacity-80">
                                {Math.floor(Math.random() * 500) + 1}
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="space-y-1">
                              <div className="font-medium">Sección {1000 + i}</div>
                              <div className="text-xs">
                                <span className="font-medium">{selectedParty}:</span>{" "}
                                {Math.floor(Math.random() * 1000) + 100} votos
                              </div>
                              <div className="text-xs">
                                Lista nominal: {Math.floor(Math.random() * 5000) + 1000} votantes
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  ))}

                  {/* Marcadores de ubicación */}
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={`marker-${i}`}
                      className="absolute flex flex-col items-center animate-bounce"
                      style={{
                        left: `${Math.random() * 80 + 10}%`,
                        top: `${Math.random() * 80 + 10}%`,
                      }}
                    >
                      <MapPin className="h-6 w-6 text-primary" />
                      <div className="text-xs bg-background p-1 rounded shadow">Distrito {i + 1}</div>
                    </div>
                  ))}

                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {selectedParty ? (
                      <div className="text-center">
                        <div className="text-4xl font-bold text-white/10">{selectedParty}</div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-4 bg-white/80 rounded-lg shadow-lg">
                        <p className="text-center">Selecciona un partido para visualizar su distribución en el mapa</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="absolute top-2 right-2 flex flex-col gap-2">
                <Button variant="outline" size="icon" className="bg-white/80" onClick={handleZoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="bg-white/80" onClick={handleZoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="bg-white/80">
                  <Layers className="h-4 w-4" />
                </Button>
              </div>

              <div className="absolute bottom-2 right-2">
                <Button variant="outline" className="bg-white/80">
                  <Download className="h-4 w-4 mr-2" />
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

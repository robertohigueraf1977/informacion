"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Download, Map, ZoomIn, ZoomOut, Layers } from "lucide-react"

interface SectionMapProps {
  data: any[]
}

export function SectionMap({ data }: SectionMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [selectedParty, setSelectedParty] = useState<string | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [colorScale, setColorScale] = useState<"linear" | "quantile">("linear")
  const [opacity, setOpacity] = useState(0.7)

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
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // En una implementación real, aquí se renderizaría un mapa con Leaflet o similar
  // Para este ejemplo, mostraremos un placeholder

  return (
    <Card className="h-full">
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
                    {party}
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
            <Label>Opacidad: {opacity * 100}%</Label>
            <Slider
              value={[opacity * 100]}
              min={10}
              max={100}
              step={5}
              onValueChange={(value) => setOpacity(value[0] / 100)}
            />
          </div>
        </div>

        <div className="relative border rounded-md overflow-hidden" style={{ height: "500px" }}>
          {!mapLoaded ? (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
              <div className="text-center">
                <Map className="h-12 w-12 mx-auto text-muted-foreground animate-pulse" />
                <p className="mt-2">Cargando mapa...</p>
              </div>
            </div>
          ) : (
            <>
              <div ref={mapContainerRef} className="absolute inset-0 bg-slate-100 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-muted-foreground mb-2">
                    {selectedParty
                      ? `Mostrando resultados de ${selectedParty}`
                      : "Selecciona un partido para visualizar"}
                  </p>
                  <div
                    className="w-16 h-16 rounded-full mx-auto mb-4"
                    style={{
                      backgroundColor: selectedParty ? partyColors[selectedParty] || "#6b7280" : "#e5e7eb",
                      opacity: opacity,
                    }}
                  ></div>
                  <p className="text-sm text-muted-foreground">
                    Esta es una visualización de ejemplo. En una implementación real, aquí se mostraría un mapa con las
                    secciones electorales coloreadas según los resultados.
                  </p>
                </div>
              </div>

              <div className="absolute top-2 right-2 flex flex-col gap-2">
                <Button variant="outline" size="icon" className="bg-white">
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="bg-white">
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="bg-white">
                  <Layers className="h-4 w-4" />
                </Button>
              </div>

              <div className="absolute bottom-2 right-2">
                <Button variant="outline" className="bg-white">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Mapa
                </Button>
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
    </Card>
  )
}

"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"

// Importar Leaflet dinámicamente para evitar problemas de SSR
const MapWithNoSSR = dynamic(() => import("./map-component"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] flex items-center justify-center">
      <div className="space-y-4">
        <Skeleton className="h-[600px] w-full" />
      </div>
    </div>
  ),
})

export function DistritoMap() {
  const [geoJsonData, setGeoJsonData] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [colorBy, setColorBy] = useState<string>("DISTRITO_L") // Por defecto, colorear por distrito local
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    console.log("DistritoMap montado correctamente")
  }, [])

  useEffect(() => {
    const fetchGeoJsonData = async () => {
      try {
        setLoading(true)
        console.log("Iniciando solicitud a /api/geojson/secciones")
        const response = await fetch("/api/geojson/secciones", {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("Error response:", errorText)
          throw new Error(`Error al cargar el archivo GeoJSON: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        console.log(
          "GeoJSON data loaded successfully:",
          data.features ? `${data.features.length} features` : "No features",
        )
        setGeoJsonData(data)
      } catch (err) {
        console.error("Error al cargar los datos GeoJSON:", err)
        setError(err instanceof Error ? err.message : "Error desconocido al cargar los datos")
      } finally {
        setLoading(false)
      }
    }

    fetchGeoJsonData()
  }, [])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const data = JSON.parse(content)
        console.log("File loaded successfully:", data.features ? `${data.features.length} features` : "No features")
        setGeoJsonData(data)
        setError(null)
      } catch (err) {
        console.error("Error al parsear el archivo GeoJSON:", err)
        setError("El archivo seleccionado no es un GeoJSON válido")
      }
    }
    reader.onerror = () => {
      setError("Error al leer el archivo")
    }
    reader.readAsText(file)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center flex-wrap gap-4">
          <CardTitle>Mapa de Distritos</CardTitle>
          <div className="flex items-center space-x-4 flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="colorBy">Colorear por:</Label>
              <div className="relative z-[1000]">
                <Select value={colorBy} onValueChange={setColorBy}>
                  <SelectTrigger id="colorBy" className="w-[180px]">
                    <SelectValue placeholder="Selecciona una opción" />
                  </SelectTrigger>
                  <SelectContent className="z-[1001]">
                    <SelectItem value="DISTRITO_L">Distrito Local</SelectItem>
                    <SelectItem value="DISTRITO_F">Distrito Federal</SelectItem>
                    <SelectItem value="MUNICIPIO">Municipio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <input
                type="file"
                accept=".geojson,.json"
                onChange={handleFileUpload}
                className="hidden"
                ref={fileInputRef}
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <Upload size={16} />
                Cargar GeoJSON
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="w-full h-[600px] flex items-center justify-center">
            <div className="space-y-4">
              <Skeleton className="h-[600px] w-full" />
            </div>
          </div>
        ) : error ? (
          <div className="w-full h-[600px] flex items-center justify-center">
            <div className="text-center">
              <Badge variant="destructive" className="mb-2">
                Error
              </Badge>
              <p className="text-muted-foreground">{error}</p>
              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload size={16} />
                  Cargar GeoJSON manualmente
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <MapWithNoSSR geoJsonData={geoJsonData} colorBy={colorBy} />
        )}
      </CardContent>
    </Card>
  )
}

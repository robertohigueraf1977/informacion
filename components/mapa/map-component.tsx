"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { MapContainer, TileLayer, useMap, LayersControl } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { DataTable } from "@/components/ui/data-table"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { UserPlus, MapPin, Phone, Mail, ChevronRight } from "lucide-react"
import Link from "next/link"

// Interfaz para las propiedades extendidas del GeoJSON
interface ExtendedFeatureProperties {
  ID: string | number
  SECCION: string | number
  DISTRITO_L: number
  DISTRITO_F: number
  MUNICIPIO: number
  BD_ID: number | null
  BD_NOMBRE: string | null
  MUNICIPIO_NOMBRE: string
  DISTRITO_LOCAL_NOMBRE: string
  DISTRITO_FEDERAL_NOMBRE: string
  DISTRITO_L_NOMBRE: string
  DISTRITO_F_NOMBRE: string
  MUNICIPIO_NOMBRE_COLORACION: string
  PERSONAS_REGISTRADAS: number
  [key: string]: any
}

// Interfaz para los datos de persona
interface Persona {
  id: number
  nombre: string
  apellidoPaterno: string
  apellidoMaterno: string | null
  telefono: string | null
  email: string | null
  referente: boolean
  sector: {
    nombre: string
  } | null
  domicilio: {
    calle: string
    numero: string | null
    colonia: string | null
    localidad: string | null
  } | null
}

// Interfaz para la información de la sección
interface SeccionInfo {
  id: number
  nombre: string
  municipio: {
    id: number
    nombre: string
  } | null
  distritoLocal: {
    id: number | null
    nombre: string | null
  } | null
  distritoFederal: {
    id: number | null
    nombre: string | null
  } | null
  _count: {
    personas: number
  }
}

// Función para generar colores distintos basados en un índice
const getColorForDistrict = (index: number): string => {
  // Paleta de colores que son visualmente distintos
  const colors = [
    "#1f77b4",
    "#ff7f0e",
    "#2ca02c",
    "#d62728",
    "#9467bd",
    "#8c564b",
    "#e377c2",
    "#7f7f7f",
    "#bcbd22",
    "#17becf",
    "#aec7e8",
    "#ffbb78",
    "#98df8a",
    "#ff9896",
    "#c5b0d5",
    "#c49c94",
    "#f7b6d2",
    "#c7c7c7",
    "#dbdb8d",
    "#9edae5",
  ]
  return colors[index % colors.length]
}

// Función para extraer ID de sección de forma consistente
const extraerIdSeccion = (properties: ExtendedFeatureProperties): number | null => {
  console.log("🔍 Extrayendo ID de sección de properties:", properties)

  // Prioridad 1: BD_ID (más confiable si existe)
  if (properties.BD_ID !== null && properties.BD_ID !== undefined && !isNaN(Number(properties.BD_ID))) {
    const bdId = Number(properties.BD_ID)
    console.log("✅ Usando BD_ID:", bdId)
    return bdId
  }

  // Prioridad 2: Usar SECCION del GeoJSON para buscar en la BD
  // Esto requiere una búsqueda adicional, pero por ahora usamos el ID del GeoJSON como fallback
  if (properties.ID !== null && properties.ID !== undefined && !isNaN(Number(properties.ID))) {
    const geoId = Number(properties.ID)
    console.log("⚠️ Usando GeoJSON ID como fallback:", geoId)
    return geoId
  }

  console.error("❌ No se pudo extraer un ID válido de las properties:", properties)
  return null
}

// Componente para actualizar el mapa
function MapUpdater({
  data,
  colorBy,
  setColorMap,
  onSeccionSelect,
}: {
  data: any | null
  colorBy: string
  setColorMap: (colorMap: { [key: string]: string }) => void
  onSeccionSelect: (seccionId: number, properties: ExtendedFeatureProperties, color: string) => void
}) {
  const map = useMap()
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null)
  const initializedRef = useRef(false)
  const colorMapRef = useRef<{ [key: string]: string }>({})
  const selectedLayerRef = useRef<L.Layer | null>(null)

  // Este efecto se ejecuta solo una vez al montar el componente
  useEffect(() => {
    console.log("MapUpdater montado")
    return () => {
      console.log("MapUpdater desmontado")
      if (geoJsonLayerRef.current) {
        geoJsonLayerRef.current.removeFrom(map)
      }
    }
  }, [map])

  // Este efecto se ejecuta cuando cambian los datos o el modo de coloración
  useEffect(() => {
    console.log("MapUpdater: Datos o colorBy cambiados", {
      dataExists: !!data,
      featuresCount: data?.features?.length || 0,
      colorBy,
    })

    // Si no hay datos, no hacemos nada
    if (!data || !data.features || !data.features.length) {
      console.log("No hay datos GeoJSON para procesar")
      return
    }

    // Limpiar la capa GeoJSON anterior si existe
    if (geoJsonLayerRef.current) {
      console.log("Eliminando capa GeoJSON anterior")
      geoJsonLayerRef.current.removeFrom(map)
      geoJsonLayerRef.current = null
    }

    try {
      console.log("Procesando datos GeoJSON")

      // Agrupar features por el campo seleccionado usando los nombres correctos
      const groupedFeatures: { [key: string]: any[] } = {}
      data.features.forEach((feature: any, index: number) => {
        if (!feature.properties) {
          console.warn(`Feature ${index} no tiene properties`)
          return
        }

        // Obtener el valor para coloración usando los nombres enriquecidos
        let key = "Desconocido"

        if (colorBy === "DISTRITO_L") {
          key = feature.properties.DISTRITO_L_NOMBRE || feature.properties.DISTRITO_LOCAL_NOMBRE || "No asignado"
        } else if (colorBy === "DISTRITO_F") {
          key = feature.properties.DISTRITO_F_NOMBRE || feature.properties.DISTRITO_FEDERAL_NOMBRE || "No asignado"
        } else if (colorBy === "MUNICIPIO") {
          key = feature.properties.MUNICIPIO_NOMBRE_COLORACION || feature.properties.MUNICIPIO_NOMBRE || "No asignado"
        } else {
          key = feature.properties[colorBy] || "Desconocido"
        }

        if (!groupedFeatures[key]) {
          groupedFeatures[key] = []
        }
        groupedFeatures[key].push(feature)
      })

      console.log("Grupos creados para coloración:", Object.keys(groupedFeatures))

      // Crear un mapa de colores para cada grupo
      const newColorMap: { [key: string]: string } = {}
      Object.keys(groupedFeatures).forEach((key, index) => {
        newColorMap[key] = getColorForDistrict(index)
      })

      // Comparar si el mapa de colores ha cambiado realmente
      const currentKeys = Object.keys(newColorMap).sort().join(",")
      const prevKeys = Object.keys(colorMapRef.current).sort().join(",")

      // Solo actualizar el estado si el mapa de colores ha cambiado
      if (currentKeys !== prevKeys || colorBy !== colorMapRef.current["__colorBy"]) {
        console.log("Actualizando mapa de colores")
        colorMapRef.current = { ...newColorMap, __colorBy: colorBy }
        setColorMap(newColorMap)
      }

      // Crear una nueva capa GeoJSON con estilos basados en el grupo
      console.log("Creando nueva capa GeoJSON")
      const geoJsonLayer = L.geoJSON(data, {
        style: (feature) => {
          if (!feature || !feature.properties) return {}

          let key = "Desconocido"
          if (colorBy === "DISTRITO_L") {
            key = feature.properties.DISTRITO_L_NOMBRE || feature.properties.DISTRITO_LOCAL_NOMBRE || "No asignado"
          } else if (colorBy === "DISTRITO_F") {
            key = feature.properties.DISTRITO_F_NOMBRE || feature.properties.DISTRITO_FEDERAL_NOMBRE || "No asignado"
          } else if (colorBy === "MUNICIPIO") {
            key = feature.properties.MUNICIPIO_NOMBRE_COLORACION || feature.properties.MUNICIPIO_NOMBRE || "No asignado"
          } else {
            key = feature.properties[colorBy] || "Desconocido"
          }

          return {
            fillColor: newColorMap[key] || "#cccccc",
            weight: 1,
            opacity: 1,
            color: "white",
            fillOpacity: 0.5,
          }
        },
        onEachFeature: (feature, layer) => {
          if (!feature.properties) return

          // Añadir eventos de hover y clic
          layer.on({
            mouseover: (e) => {
              const layer = e.target
              layer.setStyle({
                weight: 3,
                color: "#666",
                fillOpacity: 0.7,
              })
              layer.bringToFront()
            },
            mouseout: (e) => {
              if (selectedLayerRef.current !== e.target) {
                geoJsonLayer.resetStyle(e.target)
              }
            },
            click: (e) => {
              console.log("🖱️ Click en feature:", feature.properties)

              // Detener la propagación del evento
              L.DomEvent.stopPropagation(e)

              // Restaurar el estilo de la capa previamente seleccionada
              if (selectedLayerRef.current) {
                geoJsonLayer.resetStyle(selectedLayerRef.current)
              }

              // Guardar la capa actual como seleccionada
              selectedLayerRef.current = e.target

              // Obtener el color de la sección seleccionada
              let key = "Desconocido"
              if (colorBy === "DISTRITO_L") {
                key = feature.properties.DISTRITO_L_NOMBRE || feature.properties.DISTRITO_LOCAL_NOMBRE || "No asignado"
              } else if (colorBy === "DISTRITO_F") {
                key =
                  feature.properties.DISTRITO_F_NOMBRE || feature.properties.DISTRITO_FEDERAL_NOMBRE || "No asignado"
              } else if (colorBy === "MUNICIPIO") {
                key =
                  feature.properties.MUNICIPIO_NOMBRE_COLORACION || feature.properties.MUNICIPIO_NOMBRE || "No asignado"
              } else {
                key = feature.properties[colorBy] || "Desconocido"
              }

              const color = newColorMap[key] || "#cccccc"

              // Aplicar estilo de selección
              e.target.setStyle({
                weight: 3,
                color: "#000",
                fillOpacity: 0.7,
              })

              // Extraer ID de forma consistente
              const seccionIdParaConsulta = extraerIdSeccion(feature.properties)

              if (seccionIdParaConsulta !== null) {
                console.log("🎯 Llamando onSeccionSelect con ID:", seccionIdParaConsulta)
                onSeccionSelect(seccionIdParaConsulta, feature.properties, color)
              } else {
                console.error("❌ No se pudo determinar un ID válido para la consulta")
                alert(`Error: No se pudo determinar el ID de la sección.
                
Información disponible:
- GeoJSON ID: ${feature.properties.ID}
- GeoJSON SECCION: ${feature.properties.SECCION}
- BD ID: ${feature.properties.BD_ID}
- BD NOMBRE: ${feature.properties.BD_NOMBRE}

Por favor, verifica la configuración del GeoJSON y la base de datos.`)
              }
            },
          })
        },
      }).addTo(map)

      geoJsonLayerRef.current = geoJsonLayer
      console.log("Capa GeoJSON añadida al mapa")

      // Ajustar el zoom para mostrar todos los datos SOLO LA PRIMERA VEZ
      if (!initializedRef.current) {
        try {
          console.log("Ajustando zoom inicial")
          const bounds = geoJsonLayer.getBounds()
          map.fitBounds(bounds)
          initializedRef.current = true
        } catch (error) {
          console.error("Error al ajustar los límites del mapa:", error)
        }
      }
    } catch (error) {
      console.error("Error al procesar los datos GeoJSON:", error)
    }
  }, [data, colorBy, map, onSeccionSelect, setColorMap])

  return null
}

// Componente principal del mapa
interface MapComponentProps {
  geoJsonData: any | null
  colorBy: string
  height?: number
  showControls?: boolean
  onSectionClick?: (sectionId: string, properties: any) => void
}

export default function MapComponent({
  geoJsonData,
  colorBy,
  height = 600,
  showControls = true,
  onSectionClick,
}: MapComponentProps) {
  const [colorMap, setColorMap] = useState<{ [key: string]: string }>({})
  const [selectedSeccionId, setSelectedSeccionId] = useState<number | null>(null)
  const [selectedSeccionProps, setSelectedSeccionProps] = useState<ExtendedFeatureProperties | null>(null)
  const [personas, setPersonas] = useState<Persona[]>([])
  const [seccionInfo, setSeccionInfo] = useState<SeccionInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPersonas, setShowPersonas] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiCallCount, setApiCallCount] = useState(0)
  const [selectedSectionColor, setSelectedSectionColor] = useState<string>("#cccccc")
  const [rawApiData, setRawApiData] = useState<any>(null)
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null)

  // Asegurarse de que el icono de Leaflet esté configurado correctamente
  useEffect(() => {
    console.log("MapComponent montado")
    // Solución para el problema de los iconos en Leaflet con Next.js
    delete (L.Icon.Default.prototype as any)._getIconUrl

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    })

    return () => {
      console.log("MapComponent desmontado")
    }
  }, [])

  // Función para cargar personas por sección
  const loadPersonasBySeccion = useCallback(
    async (seccionId: number) => {
      try {
        console.log(`🔄 Iniciando carga de datos para sección ${seccionId} (llamada #${apiCallCount + 1})`)
        setLoading(true)
        setError(null)
        setApiCallCount((prev) => prev + 1)
        setRawApiData(null)

        console.log(`📡 Realizando fetch a /api/secciones/${seccionId}/personas`)
        const response = await fetch(`/api/secciones/${seccionId}/personas`, {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`❌ Error en la respuesta (${response.status}):`, errorText)
          setError(`Error al cargar datos: ${response.status} ${response.statusText}`)
          throw new Error(`Error al cargar personas: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        console.log("📦 Datos recibidos de la API:", data)

        setRawApiData(data)
        setPersonas(data.personas || [])
        setSeccionInfo(data.seccion || null)

        console.log("💾 Información de sección guardada:", data.seccion)
        console.log("👥 Personas guardadas:", data.personas?.length || 0)

        if (!data.seccion) {
          console.warn("⚠️ No se recibió información de la sección")
        }

        if (!data.personas || data.personas.length === 0) {
          console.log("ℹ️ No se recibieron personas para esta sección")
        }
      } catch (error) {
        console.error("❌ Error al cargar personas:", error)
        setError(`Error al cargar datos: ${error instanceof Error ? error.message : String(error)}`)
      } finally {
        setLoading(false)
      }
    },
    [apiCallCount],
  )

  // Manejar la selección de una sección
  const handleSeccionSelect = useCallback(
    (seccionId: number, properties: ExtendedFeatureProperties, color: string) => {
      console.log("🎯 Sección seleccionada:", seccionId, properties, "Color:", color)
      setSelectedSeccionId(seccionId)
      setSelectedSeccionProps(properties)
      setSelectedSectionColor(color)
      setShowPersonas(false)
      setError(null)

      // Cargar datos de la sección
      loadPersonasBySeccion(seccionId)
    },
    [loadPersonasBySeccion],
  )

  // Columnas para la tabla de personas
  const columns = [
    {
      accessorKey: "nombre",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
    },
    {
      accessorKey: "apellidoPaterno",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Apellido Paterno" />,
    },
    {
      accessorKey: "apellidoMaterno",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Apellido Materno" />,
      cell: ({ row }) => <div>{row.getValue("apellidoMaterno") || "-"}</div>,
    },
    {
      accessorKey: "telefono",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Teléfono" />,
      cell: ({ row }) => (
        <div className="flex items-center">
          {row.getValue("telefono") ? (
            <>
              <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
              {row.getValue("telefono")}
            </>
          ) : (
            "-"
          )}
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
      cell: ({ row }) => (
        <div className="flex items-center">
          {row.getValue("email") ? (
            <>
              <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
              {row.getValue("email")}
            </>
          ) : (
            "-"
          )}
        </div>
      ),
    },
    {
      accessorKey: "domicilio",
      header: "Domicilio",
      cell: ({ row }) => {
        const domicilio = row.original.domicilio
        if (!domicilio) return "-"

        return (
          <div className="flex items-center">
            <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
            {`${domicilio.calle} ${domicilio.numero || ""}, ${domicilio.colonia || ""}`}
          </div>
        )
      },
    },
    {
      accessorKey: "sector",
      header: "Sector",
      cell: ({ row }) => {
        const sector = row.original.sector
        return <div>{sector?.nombre || "-"}</div>
      },
    },
    {
      accessorKey: "referente",
      header: "Referente",
      cell: ({ row }) => {
        const referente = row.getValue("referente")
        return referente ? <Badge variant="default">Sí</Badge> : <Badge variant="outline">No</Badge>
      },
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Mapa (ocupa 2/3 del espacio en pantallas medianas y grandes) */}
      <div className="md:col-span-2">
        <div className="w-full h-[600px] rounded-md overflow-hidden border">
          <MapContainer
            center={[24.13307907237313, -110.34244072447111]}
            zoom={7}
            style={{ height: "100%", width: "100%" }}
            attributionControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LayersControl position="topright">
              <LayersControl.BaseLayer checked name="OpenStreetMap">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Satélite">
                <TileLayer
                  attribution='&copy; <a href="https://www.esri.com">Esri</a>'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
              </LayersControl.BaseLayer>
            </LayersControl>
            <MapUpdater
              data={geoJsonData}
              colorBy={colorBy}
              setColorMap={setColorMap}
              onSeccionSelect={handleSeccionSelect}
            />
          </MapContainer>
        </div>

        {/* Leyenda debajo del mapa */}
        {Object.keys(colorMap).length > 0 && (
          <div className="bg-white p-4 rounded-md border shadow-sm mt-4">
            <h3 className="font-medium mb-2">Leyenda</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {Object.entries(colorMap)
                .filter(([key]) => key !== "__colorBy")
                .map(([key, color]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div style={{ backgroundColor: color }} className="w-4 h-4 rounded-sm flex-shrink-0"></div>
                    <span className="text-sm truncate">{key}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Panel lateral (ocupa 1/3 del espacio en pantallas medianas y grandes) */}
      <div className="md:col-span-1">
        <Card
          className={`h-full transition-all duration-200 ${selectedSeccionId ? "shadow-lg" : ""}`}
          style={{
            borderColor: selectedSeccionId ? `${selectedSectionColor}40` : undefined,
          }}
        >
          <CardHeader
            className="border-b"
            style={{
              background: selectedSeccionId ? `${selectedSectionColor}15` : undefined,
              borderColor: selectedSeccionId ? `${selectedSectionColor}30` : undefined,
            }}
          >
            <div className="flex items-center gap-2">
              {selectedSeccionId && (
                <div
                  className="w-4 h-4 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: selectedSectionColor }}
                ></div>
              )}
              <CardTitle>
                {selectedSeccionId
                  ? `Sección Electoral: ${selectedSeccionProps?.SECCION || selectedSeccionProps?.BD_NOMBRE || seccionInfo?.nombre || selectedSeccionId}`
                  : "Información Electoral"}
              </CardTitle>
            </div>
            <CardDescription>
              {selectedSeccionId
                ? "Información detallada de la sección seleccionada"
                : "Selecciona una sección en el mapa para ver su información detallada."}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
                <div className="mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => selectedSeccionId && loadPersonasBySeccion(selectedSeccionId)}
                  >
                    Reintentar
                  </Button>
                </div>
              </div>
            ) : loading ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : selectedSeccionId ? (
              !showPersonas ? (
                <div className="space-y-4">
                  {/* Información política y demográfica */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 rounded-md border border-gray-100">
                      <h3 className="text-xs font-semibold text-gray-500 mb-1">Distrito Local</h3>
                      <div className="text-sm font-medium">
                        {selectedSeccionProps?.DISTRITO_L_NOMBRE ||
                          selectedSeccionProps?.DISTRITO_LOCAL_NOMBRE ||
                          seccionInfo?.distritoLocal?.nombre ||
                          "No asignado"}
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-md border border-gray-100">
                      <h3 className="text-xs font-semibold text-gray-500 mb-1">Distrito Federal</h3>
                      <div className="text-sm font-medium">
                        {selectedSeccionProps?.DISTRITO_F_NOMBRE ||
                          selectedSeccionProps?.DISTRITO_FEDERAL_NOMBRE ||
                          seccionInfo?.distritoFederal?.nombre ||
                          "No asignado"}
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-md border border-gray-100">
                      <h3 className="text-xs font-semibold text-gray-500 mb-1">Municipio</h3>
                      <div className="text-sm font-medium">
                        {selectedSeccionProps?.MUNICIPIO_NOMBRE_COLORACION ||
                          selectedSeccionProps?.MUNICIPIO_NOMBRE ||
                          seccionInfo?.municipio?.nombre ||
                          "No asignado"}
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-md border border-gray-100">
                      <h3 className="text-xs font-semibold text-gray-500 mb-1">Personas Registradas</h3>
                      <div className="text-sm font-medium">
                        {selectedSeccionProps?.PERSONAS_REGISTRADAS !== undefined
                          ? selectedSeccionProps.PERSONAS_REGISTRADAS
                          : seccionInfo?._count?.personas !== undefined
                            ? seccionInfo._count.personas
                            : "0"}
                      </div>
                    </div>
                  </div>

                  {/* Información de depuración mejorada */}
                  <div className="p-3 bg-gray-50 rounded-md border border-gray-100 text-xs">
                    <h3 className="font-semibold text-gray-500 mb-1">Información de mapeo GeoJSON ↔ BD</h3>
                    <div className="space-y-1">
                      <div>
                        🗺️ GeoJSON ID: <span className="font-mono">{selectedSeccionProps?.ID}</span>
                      </div>
                      <div>
                        📍 GeoJSON SECCION: <span className="font-mono">{selectedSeccionProps?.SECCION}</span>
                      </div>
                      <div>
                        🏛️ GeoJSON DISTRITO_L: <span className="font-mono">{selectedSeccionProps?.DISTRITO_L}</span> →{" "}
                        {selectedSeccionProps?.DISTRITO_L_NOMBRE}
                      </div>
                      <div>
                        🏛️ GeoJSON DISTRITO_F: <span className="font-mono">{selectedSeccionProps?.DISTRITO_F}</span> →{" "}
                        {selectedSeccionProps?.DISTRITO_F_NOMBRE}
                      </div>
                      <div>
                        🏢 GeoJSON MUNICIPIO: <span className="font-mono">{selectedSeccionProps?.MUNICIPIO}</span> →{" "}
                        {selectedSeccionProps?.MUNICIPIO_NOMBRE}
                      </div>
                      <div>
                        🎯 BD ID (usado para consulta):{" "}
                        <span className="font-mono text-green-600">
                          {selectedSeccionProps?.BD_ID || selectedSeccionId}
                        </span>
                      </div>
                      <div>
                        📝 BD NOMBRE:{" "}
                        <span className="font-mono">{selectedSeccionProps?.BD_NOMBRE || seccionInfo?.nombre}</span>
                      </div>
                      <div>✅ Datos de API recibidos: {seccionInfo ? "Sí" : "No"}</div>
                      <div>📊 Datos de GeoJSON: {selectedSeccionProps ? "Sí" : "No"}</div>
                    </div>

                    {/* Verificación de consistencia mejorada */}
                    {selectedSeccionProps?.SECCION &&
                      selectedSeccionProps?.BD_NOMBRE &&
                      selectedSeccionProps.SECCION.toString() !== selectedSeccionProps.BD_NOMBRE.toString() && (
                        <div className="mt-2 p-2 bg-blue-100 border border-blue-300 rounded text-blue-800">
                          ℹ️ Mapeo: GeoJSON SECCION ({selectedSeccionProps.SECCION}) → BD NOMBRE (
                          {selectedSeccionProps.BD_NOMBRE})
                        </div>
                      )}

                    {!selectedSeccionProps?.BD_ID && (
                      <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-yellow-800">
                        ⚠️ No se encontró mapeo en la BD para esta sección
                      </div>
                    )}

                    {/* Botón para mostrar/ocultar los datos crudos */}
                    <div className="mt-2">
                      <details>
                        <summary className="cursor-pointer text-blue-500 hover:text-blue-700">
                          Ver datos crudos de la API
                        </summary>
                        <div className="mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-[200px] text-xs">
                          <pre>{rawApiData ? JSON.stringify(rawApiData, null, 2) : "No hay datos"}</pre>
                        </div>
                      </details>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="grid grid-cols-1 gap-2 mt-6">
                    <Button
                      className="w-full"
                      onClick={() => setShowPersonas(true)}
                      disabled={loading}
                      style={{
                        backgroundColor: selectedSectionColor,
                        borderColor: selectedSectionColor,
                      }}
                    >
                      {loading ? "Cargando..." : "Ver Personas"}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button variant="outline" className="w-full bg-transparent" asChild>
                      <Link href={`/personas/crear?seccionId=${selectedSeccionId}`}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Registrar Nueva Persona
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Button
                    variant="outline"
                    className="mb-4 bg-transparent"
                    onClick={() => setShowPersonas(false)}
                    style={{
                      borderColor: selectedSectionColor,
                      color: selectedSectionColor,
                    }}
                  >
                    Volver a la información de la sección
                  </Button>

                  {loading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  ) : personas.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">No hay personas registradas en esta sección.</p>
                      <Button
                        asChild
                        size="sm"
                        style={{
                          backgroundColor: selectedSectionColor,
                          borderColor: selectedSectionColor,
                        }}
                      >
                        <Link href={`/personas/crear?seccionId=${selectedSeccionId}`}>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Registrar Nueva Persona
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center mb-4">
                        <div className="text-sm text-muted-foreground">
                          {personas.length} {personas.length === 1 ? "persona" : "personas"} registradas
                        </div>
                        <Button
                          asChild
                          size="sm"
                          style={{
                            backgroundColor: selectedSectionColor,
                            borderColor: selectedSectionColor,
                          }}
                        >
                          <Link href={`/personas/crear?seccionId=${selectedSeccionId}`}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Añadir Persona
                          </Link>
                        </Button>
                      </div>
                      <div className="overflow-auto max-h-[400px]">
                        <DataTable
                          columns={columns}
                          data={personas}
                          searchColumn="nombre"
                          searchPlaceholder="Buscar persona..."
                          pagination={false}
                        />
                      </div>
                    </>
                  )}
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                <MapPin className="h-12 w-12 mb-4 text-gray-300" />
                <p className="text-center">Haz clic en una sección del mapa para ver su información</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

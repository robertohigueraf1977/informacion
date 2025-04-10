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
  SECCION: string
  SECCION_ID: number
  DISTRITO_L: string
  DISTRITO_F: string
  MUNICIPIO: string
  MUNICIPIO_NOMBRE: string
  DISTRITO_LOCAL_NOMBRE: string
  DISTRITO_FEDERAL_NOMBRE: string
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

  // Añadir una nueva referencia para la capa seleccionada actualmente
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
      // Agrupar features por el campo seleccionado
      const groupedFeatures: { [key: string]: any[] } = {}
      data.features.forEach((feature: any) => {
        if (!feature.properties) return
        const key = feature.properties[colorBy] || "Desconocido"
        if (!groupedFeatures[key]) {
          groupedFeatures[key] = []
        }
        groupedFeatures[key].push(feature)
      })

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
          const key = feature.properties[colorBy] || "Desconocido"
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
            // Dentro del evento click, añadir código para resaltar la sección seleccionada
            click: (e) => {
              console.log("Click en feature:", feature.properties)

              // Detener la propagación del evento
              L.DomEvent.stopPropagation(e)

              // Restaurar el estilo de la capa previamente seleccionada
              if (selectedLayerRef.current) {
                geoJsonLayer.resetStyle(selectedLayerRef.current)
              }

              // Guardar la capa actual como seleccionada
              selectedLayerRef.current = e.target

              // Obtener el color de la sección seleccionada
              const key = feature.properties[colorBy] || "Desconocido"
              const color = newColorMap[key] || "#cccccc"

              // Aplicar estilo de selección
              e.target.setStyle({
                weight: 3,
                color: "#000",
                fillOpacity: 0.7,
              })

              // Si la feature tiene un ID de sección, llamar a onSeccionSelect con el color
              if (feature.properties && feature.properties.ID) {
                console.log("Llamando a onSeccionSelect con ID:", feature.properties.ID)
                onSeccionSelect(feature.properties.ID, feature.properties, color)
              } /* else if (feature.properties && feature.properties.SECCION) {
                // Intentar usar el nombre de la sección como ID si no hay SECCION_ID
                console.log("No hay SECCION_ID, intentando usar SECCION:", feature.properties.SECCION)
                const seccionId = Number.parseInt(feature.properties.SECCION, 10)
                if (!isNaN(seccionId)) {
                  console.log("Usando SECCION como ID:", seccionId)
                  onSeccionSelect(seccionId, feature.properties, color)
                } else {
                  console.error("No se pudo determinar el ID de la sección")
                }
              } */ else {
                console.error("La feature no tiene propiedades de sección")
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
}

export default function MapComponent({ geoJsonData, colorBy }: MapComponentProps) {
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
  // Añadir un nuevo estado para almacenar los datos crudos de la API
  const [rawApiData, setRawApiData] = useState<any>(null)

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

  // Modificar la función loadPersonasBySeccion para usar useCallback y mejorar la depuración
  const loadPersonasBySeccion = useCallback(
    async (seccionId: number) => {
      try {
        console.log(`Iniciando carga de datos para sección ${seccionId} (llamada #${apiCallCount + 1})`)
        setLoading(true)
        setError(null)
        setApiCallCount((prev) => prev + 1)
        setRawApiData(null) // Limpiar datos anteriores

        // Usar un timeout para asegurar que la UI se actualice antes de la llamada a la API
        await new Promise((resolve) => setTimeout(resolve, 0))

        console.log(`Realizando fetch a /api/secciones/${seccionId}/personas`)
        const response = await fetch(`/api/secciones/${seccionId}/personas`, {
          // Añadir un parámetro para evitar caché
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`Error en la respuesta (${response.status}):`, errorText)
          setError(`Error al cargar datos: ${response.status} ${response.statusText}`)
          throw new Error(`Error al cargar personas: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        console.log("Datos recibidos de la API:", data)

        // Guardar los datos crudos para mostrarlos
        setRawApiData(data)

        // Asegurar que guardamos todos los datos recibidos
        setPersonas(data.personas || [])
        setSeccionInfo(data.seccion || null)

        // Mostrar información detallada en la consola para depuración
        console.log("Información de sección guardada:", data.seccion)
        console.log("Personas guardadas:", data.personas?.length || 0)

        // Verificar si los datos están vacíos
        if (!data.seccion) {
          console.warn("No se recibió información de la sección")
        }

        if (!data.personas || data.personas.length === 0) {
          console.log("No se recibieron personas para esta sección")
        }
      } catch (error) {
        console.error("Error al cargar personas:", error)
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
      console.log("Sección seleccionada:", seccionId, properties, "Color:", color)
      setSelectedSeccionId(seccionId)
      setSelectedSeccionProps(properties)
      setSelectedSectionColor(color)
      setShowPersonas(false)
      setError(null)

      // Usar un timeout para asegurar que la UI se actualice antes de cargar los datos
      setTimeout(() => {
        loadPersonasBySeccion(seccionId)
      }, 10)
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
                  ? `Sección Electoral: ${selectedSeccionProps?.SECCION || seccionInfo?.nombre || selectedSeccionId}`
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
                  {/* Información política y demográfica combinada y simplificada */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 rounded-md border border-gray-100">
                      <h3 className="text-xs font-semibold text-gray-500 mb-1">Distrito Local</h3>
                      <div className="text-sm font-medium">
                        {seccionInfo?.distritoLocal?.nombre ||
                          "No asignado"}
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-md border border-gray-100">
                      <h3 className="text-xs font-semibold text-gray-500 mb-1">Distrito Federal</h3>
                      <div className="text-sm font-medium">
                        {seccionInfo?.distritoFederal?.nombre ||
                          "No asignado"}
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-md border border-gray-100">
                      <h3 className="text-xs font-semibold text-gray-500 mb-1">Municipio</h3>
                      <div className="text-sm font-medium">
                        {seccionInfo?.municipio?.nombre || "No asignado"}
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-md border border-gray-100">
                      <h3 className="text-xs font-semibold text-gray-500 mb-1">Personas Registradas</h3>
                      <div className="text-sm font-medium">
                        {seccionInfo?._count?.personas !== undefined
                            ? seccionInfo._count.personas
                            : "0"}
                      </div>
                    </div>
                  </div>

                  {/* Información de depuración */}
                  <div className="p-3 bg-gray-50 rounded-md border border-gray-100 text-xs">
                    <h3 className="font-semibold text-gray-500 mb-1">Información de depuración</h3>
                    <div>ID de sección: {selectedSeccionId}</div>
                    <div>Datos de API recibidos: {seccionInfo ? "Sí" : "No"}</div>
                    <div>Datos de GeoJSON: {selectedSeccionProps ? "Sí" : "No"}</div>

                    {/* Añadir un botón para mostrar/ocultar los datos crudos */}
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
                    <Button variant="outline" className="w-full" asChild>
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
                    className="mb-4"
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

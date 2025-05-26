"use client"

import type React from "react"

import { useState, useCallback, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileSpreadsheet, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GoalsAnalyzer } from "@/components/metasresultados/goals-analyzer"
import { CsvUploader } from "@/components/metasresultados/csv-uploader"

// Componentes simplificados para evitar errores de importación
function DashboardShell({ children }: { children: React.ReactNode }) {
  return <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">{children}</div>
}

function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="space-y-0.5">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
  )
}

function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  action,
}: {
  title: string
  description: string
  icon: React.ReactNode
  actionLabel: string
  action: () => void
}) {
  return (
    <Card className="p-8 text-center">
      <div className="flex flex-col items-center space-y-4">
        {icon}
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
        <Button onClick={action}>{actionLabel}</Button>
      </div>
    </Card>
  )
}

// Hook simplificado para toast
function useToast() {
  return {
    toast: ({ title, description, variant }: { title: string; description: string; variant?: string }) => {
      console.log(`Toast: ${title} - ${description}`)
    },
  }
}

export default function MetasResultadosPage() {
  const [csvData, setCsvData] = useState<any[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [seccionesData, setSeccionesData] = useState<Record<string, any>>({})
  const [userPermissions, setUserPermissions] = useState<any>(null)
  const { toast } = useToast()
  const goalsTabRef = useRef<HTMLButtonElement>(null)

  // URL del archivo CSV oficial de resultados presidencia
  const defaultCsvUrl =
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/resultados%20presidencia-5zuUUeX6nE2Gzz1iD4rUZjgC31chnI.csv"

  // Coaliciones predefinidas para el análisis
  const coalicionesPredefinidas = [
    {
      nombre: "MORENA",
      partidos: ["MORENA"],
      color: "#8B4513",
    },
    {
      nombre: "Va por México",
      partidos: ["PAN", "PRI", "PRD"],
      color: "#6B46C1",
    },
    {
      nombre: "Juntos Haremos Historia",
      partidos: ["MORENA", "PT", "PVEM"],
      color: "#9F7AEA",
    },
    {
      nombre: "PAN",
      partidos: ["PAN"],
      color: "#0066CC",
    },
    {
      nombre: "PRI",
      partidos: ["PRI"],
      color: "#FF0000",
    },
    {
      nombre: "MC",
      partidos: ["MC"],
      color: "#FF9900",
    },
  ]

  // Cargar permisos del usuario
  useEffect(() => {
    const loadUserPermissions = async () => {
      try {
        const response = await fetch("/api/auth/session")
        if (response.ok) {
          const session = await response.json()
          setUserPermissions(session?.user || null)
        }
      } catch (error) {
        console.error("Error al cargar permisos del usuario:", error)
      }
    }

    loadUserPermissions()
  }, [])

  // Cargar datos de secciones para enriquecer los datos del CSV
  const loadSeccionesData = useCallback(async () => {
    try {
      const response = await fetch("/api/secciones")
      if (!response.ok) {
        throw new Error(`Error al cargar datos de secciones: ${response.status}`)
      }

      const data = await response.json()

      // Crear un mapa de secciones para acceso rápido
      const seccionesMap: Record<string, any> = {}

      if (Array.isArray(data)) {
        data.forEach((seccion) => {
          // Usar el número de sección como clave
          if (seccion.numero) {
            seccionesMap[seccion.numero.toString()] = {
              id: seccion.id,
              nombre: seccion.nombre || seccion.numero,
              distritoLocal: seccion.distritoLocal?.nombre || seccion.distritoLocal?.numero || "No especificado",
              distritoFederal: seccion.distritoFederal?.nombre || seccion.distritoFederal?.numero || "No especificado",
              municipio: seccion.municipio?.nombre || "No especificado",
              sector: seccion.sector?.nombre || "No especificado",
            }
          }
        })
      }

      setSeccionesData(seccionesMap)
      console.log("Datos de secciones cargados:", Object.keys(seccionesMap).length)

      return seccionesMap
    } catch (err) {
      console.error("Error al cargar datos de secciones:", err)
      toast({
        title: "Información",
        description: "No se pudieron cargar datos de secciones del sistema. Se usarán los datos del CSV.",
        variant: "default",
      })
      return {}
    }
  }, [toast])

  // Enriquecer datos del CSV con información de secciones
  const enrichCsvData = useCallback(
    async (data: any[]) => {
      if (!data || data.length === 0) return data

      // Cargar datos de secciones si no los tenemos
      let seccionesMap = seccionesData
      if (Object.keys(seccionesMap).length === 0) {
        seccionesMap = await loadSeccionesData()
      }

      // Normalizar y enriquecer los datos
      return data.map((row) => {
        const seccionKey = row.SECCION?.toString()
        const seccionInfo = seccionKey ? seccionesMap[seccionKey] : null

        // Usar los datos del CSV como prioritarios, complementar con datos del sistema si es necesario
        return {
          ...row,
          // Mantener los datos originales del CSV
          DISTRITO_F: row.DISTRITO_F || seccionInfo?.distritoFederal || "No especificado",
          DISTRITO_L: row.DISTRITO_L || seccionInfo?.distritoLocal || "No especificado",
          MUNICIPIO: row.MUNICIPIO || seccionInfo?.municipio || "No especificado",
        }
      })
    },
    [seccionesData, loadSeccionesData],
  )

  // Cargar datos al iniciar
  useEffect(() => {
    loadSeccionesData()
  }, [loadSeccionesData])

  const handleDataLoaded = useCallback(
    async (data: any[]) => {
      setIsLoading(true)
      try {
        // Enriquecer los datos con información de secciones si es necesario
        const enrichedData = await enrichCsvData(data)

        setCsvData(enrichedData)
        setError(null)
        toast({
          title: "Resultados electorales cargados",
          description: `Se han cargado ${enrichedData.length} registros de resultados presidenciales`,
        })

        // Cambiar automáticamente a la pestaña de metas
        setTimeout(() => {
          goalsTabRef.current?.click()
        }, 500)
      } catch (err) {
        console.error("Error al procesar datos:", err)
        toast({
          title: "Error al procesar datos",
          description: "Ocurrió un error al procesar los resultados electorales",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [toast, enrichCsvData],
  )

  const handleError = useCallback(
    (errorMessage: string) => {
      setError(errorMessage)
      setCsvData(null)
      toast({
        title: "Error al cargar datos",
        description: errorMessage,
        variant: "destructive",
      })
    },
    [toast],
  )

  const handleLoadingChange = useCallback((loading: boolean) => {
    setIsLoading(loading)
  }, [])

  return (
    <DashboardShell>
      <PageHeader
        title="Metas y Resultados Electorales"
        description="Analiza resultados de la elección presidencial, establece metas y desarrolla estrategias de campaña"
      />

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList className="bg-background border w-full p-1 rounded-lg">
          <TabsTrigger
            value="upload"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex-1 rounded-md py-2"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Cargar Datos
          </TabsTrigger>
          <TabsTrigger
            value="goals"
            disabled={!csvData}
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex-1 rounded-md py-2"
            ref={goalsTabRef}
          >
            <Target className="h-4 w-4 mr-2" />
            Metas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6 animate-in fade-in-50">
          <Card>
            <CardHeader>
              <CardTitle>Cargar Resultados Electorales</CardTitle>
            </CardHeader>
            <CardContent>
              <CsvUploader
                defaultUrl={defaultCsvUrl}
                onDataLoaded={handleDataLoaded}
                onError={handleError}
                onLoadingChange={handleLoadingChange}
              />
            </CardContent>
          </Card>

          {csvData && (
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Vista previa de resultados presidenciales</CardTitle>
              </CardHeader>
              <CardContent className="-mx-6">
                <div className="overflow-auto max-h-[400px]">
                  <table className="w-full border-collapse">
                    <thead className="sticky top-0 bg-background shadow-sm z-10">
                      <tr className="bg-muted/50">
                        {Object.keys(csvData[0] || {}).map((key) => (
                          <th key={key} className="p-2 text-left text-xs font-medium text-muted-foreground border">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.slice(0, 10).map((row, i) => (
                        <tr key={i} className="border-b hover:bg-muted/30 transition-colors">
                          {Object.values(row).map((value: any, j) => (
                            <td key={j} className="p-2 text-xs border">
                              {typeof value === "number" ? value.toLocaleString() : value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  Mostrando las primeras 10 filas de {csvData.length} registros totales
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="goals">
          {csvData ? (
            <GoalsAnalyzer data={csvData} coaliciones={coalicionesPredefinidas} selectedCoalition="MORENA" />
          ) : (
            <EmptyState
              title="No hay datos para establecer metas"
              description="Carga el archivo de resultados presidencia para comenzar a establecer metas electorales."
              icon={<Target className="h-10 w-10 text-primary/40" />}
              actionLabel="Cargar Resultados"
              action={() => {
                const uploadTab = document.querySelector('[data-value="upload"]') as HTMLElement
                if (uploadTab) uploadTab.click()
              }}
            />
          )}
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}

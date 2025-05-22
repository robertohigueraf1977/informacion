"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { ElectionAnalyzer } from "@/components/metasresultados/election-analyzer"
import { CsvUploader } from "@/components/metasresultados/csv-uploader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataExplorer } from "@/components/metasresultados/data-explorer"
import { SectionMap } from "@/components/metasresultados/section-map"
import { EmptyState } from "@/components/metasresultados/empty-state"
import { FileSpreadsheet, Map, PieChart, Database } from "lucide-react"
import { DashboardShell } from "@/components/ui/dashboard-shell"
import { PageHeader } from "@/components/ui/page-header"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export default function MetasResultadosPage() {
  const [csvData, setCsvData] = useState<any[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingSystemData, setLoadingSystemData] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [systemData, setSystemData] = useState<any[] | null>(null)
  const [seccionesData, setSeccionesData] = useState<Record<string, any>>({})
  const { toast } = useToast()
  const analyzeTabRef = useRef<HTMLButtonElement>(null)

  // URL del archivo CSV predeterminado
  const defaultCsvUrl =
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/resultados%20presidencia-LVfPZagSB0isuIwJ3Xn13J2rtja6Po.csv"

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
              distrito: seccion.distritoLocal?.nombre || "No especificado",
              distritoFederal: seccion.distritoFederal?.nombre || "No especificado",
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
        title: "Error al cargar datos de secciones",
        description: "No se pudieron cargar los datos de secciones para enriquecer el CSV",
        variant: "destructive",
      })
      return {}
    }
  }, [toast])

  // Cargar datos del sistema
  const loadSystemData = useCallback(async () => {
    try {
      setLoadingSystemData(true)
      setError(null)

      // Cargar datos de secciones primero
      const seccionesMap = await loadSeccionesData()

      // Intentar cargar datos de diferentes endpoints
      const endpoints = [
        { url: "/api/votos", name: "votos" },
        { url: "/api/casillas", name: "casillas" },
        { url: "/api/partidos", name: "partidos" },
      ]

      const results: Record<string, any[]> = {}
      let hasData = false

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint.url)
          if (response.ok) {
            const data = await response.json()
            if (Array.isArray(data) && data.length > 0) {
              results[endpoint.name] = data
              hasData = true
            }
          }
        } catch (err) {
          console.warn(`Error al cargar datos de ${endpoint.url}:`, err)
        }
      }

      if (!hasData) {
        setError(
          "No se encontraron datos en el sistema. Por favor, carga un archivo CSV o utiliza la URL predeterminada.",
        )
        setSystemData(null)
      } else {
        // Procesar y transformar los datos para el formato esperado por los componentes
        const processedData = processSystemData(results, seccionesMap)
        setSystemData(processedData)
        setCsvData(processedData)

        toast({
          title: "Datos del sistema cargados",
          description: `Se han cargado ${processedData.length} registros del sistema`,
          duration: 3000,
        })

        // Cambiar automáticamente a la pestaña de análisis
        setTimeout(() => {
          analyzeTabRef.current?.click()
        }, 500)
      }
    } catch (err) {
      console.error("Error al cargar datos del sistema:", err)
      setError("Error al cargar datos del sistema. Por favor, intenta cargar un archivo CSV.")
      setSystemData(null)
    } finally {
      setLoadingSystemData(false)
    }
  }, [toast, loadSeccionesData])

  // Procesar datos del sistema para adaptarlos al formato esperado
  const processSystemData = (data: Record<string, any[]>, seccionesMap: Record<string, any>) => {
    // Si tenemos datos de votos, casillas y partidos, podemos construir el dataset
    if (data.votos?.length && data.casillas?.length && data.partidos?.length) {
      // Agrupar votos por casilla
      const votosPorCasilla: Record<number, Record<string, number>> = {}

      data.votos.forEach((voto) => {
        if (!votosPorCasilla[voto.casillaId]) {
          votosPorCasilla[voto.casillaId] = {}
        }

        // Buscar el nombre del partido
        const partido = data.partidos.find((p) => p.id === voto.partidoId)
        if (partido) {
          votosPorCasilla[voto.casillaId][partido.nombre] = voto.cantidad
        }
      })

      // Construir el dataset final
      return data.casillas.map((casilla) => {
        // Obtener información de la sección desde el mapa de secciones
        const seccionInfo = seccionesMap[casilla.seccion?.toString() || casilla.numero?.toString()]

        const votos = votosPorCasilla[casilla.id] || {}

        // Calcular total de votos
        const totalVotos = Object.values(votos).reduce((sum: number, v: any) => sum + (Number(v) || 0), 0)

        // Normalizar valores de distrito y municipio
        const distrito = seccionInfo?.distrito || "No especificado"
        const municipio = seccionInfo?.municipio || "No especificado"

        return {
          SECCION: casilla.seccion || casilla.numero,
          CASILLA: casilla.numero,
          DISTRITO: distrito,
          MUNICIPIO: municipio,
          LISTA_NOMINAL: casilla.listaNominal || 0,
          ...votos,
          TOTAL_VOTOS: totalVotos,
        }
      })
    }

    // Si no tenemos suficientes datos, devolver un array vacío
    return []
  }

  // Enriquecer datos del CSV con información de secciones
  const enrichCsvData = useCallback(
    async (data: any[]) => {
      if (!data || data.length === 0) return data

      // Verificar si los datos ya tienen distrito y municipio
      const firstRow = data[0]
      const needsEnrichment =
        !firstRow.DISTRITO ||
        !firstRow.MUNICIPIO ||
        firstRow.DISTRITO === "No especificado" ||
        firstRow.MUNICIPIO === "No especificado"

      // Si necesitamos enriquecer, asegurarnos de tener datos de secciones
      let seccionesMap = seccionesData
      if (Object.keys(seccionesMap).length === 0) {
        seccionesMap = await loadSeccionesData()
      }

      // Normalizar y enriquecer los datos
      return data.map((row) => {
        const seccionKey = row.SECCION?.toString()
        const seccionInfo = seccionKey ? seccionesMap[seccionKey] : null

        // Normalizar valores existentes o usar los de la base de datos
        const distrito =
          row.DISTRITO && row.DISTRITO !== "No especificado"
            ? String(row.DISTRITO).trim()
            : seccionInfo?.distrito || "No especificado"

        const municipio =
          row.MUNICIPIO && row.MUNICIPIO !== "No especificado"
            ? String(row.MUNICIPIO).trim()
            : seccionInfo?.municipio || "No especificado"

        return {
          ...row,
          DISTRITO: distrito,
          MUNICIPIO: municipio,
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
          title: "Datos cargados correctamente",
          description: `Se han cargado ${enrichedData.length} registros`,
          duration: 3000,
        })

        // Cambiar automáticamente a la pestaña de análisis
        setTimeout(() => {
          analyzeTabRef.current?.click()
        }, 500)
      } catch (err) {
        console.error("Error al procesar datos:", err)
        toast({
          title: "Error al procesar datos",
          description: "Ocurrió un error al enriquecer los datos con información de secciones",
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
        duration: 5000,
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
        description="Analiza resultados electorales y establece estrategias de campaña"
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
            value="system"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex-1 rounded-md py-2"
          >
            <Database className="h-4 w-4 mr-2" />
            Datos del Sistema
          </TabsTrigger>
          <TabsTrigger
            value="explore"
            disabled={!csvData}
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex-1 rounded-md py-2"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Explorar Datos
          </TabsTrigger>
          <TabsTrigger
            value="analyze"
            disabled={!csvData}
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex-1 rounded-md py-2"
            ref={analyzeTabRef}
          >
            <PieChart className="h-4 w-4 mr-2" />
            Análisis
          </TabsTrigger>
          <TabsTrigger
            value="map"
            disabled={!csvData}
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex-1 rounded-md py-2"
          >
            <Map className="h-4 w-4 mr-2" />
            Mapa
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6 animate-in fade-in-50">
          <Card>
            <CardHeader>
              <CardTitle>Cargar Archivo CSV</CardTitle>
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
                <CardTitle>Vista previa de datos</CardTitle>
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
                              {value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="system" className="space-y-6 animate-in fade-in-50">
          <Card>
            <CardHeader>
              <CardTitle>Datos del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingSystemData ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : systemData && systemData.length > 0 ? (
                <div className="space-y-4">
                  <Alert className="bg-green-50 border-green-200">
                    <AlertTitle className="text-green-800">Datos cargados correctamente</AlertTitle>
                    <AlertDescription className="text-green-700">
                      Se han cargado {systemData.length} registros del sistema. Puedes proceder a explorar y analizar
                      estos datos.
                    </AlertDescription>
                  </Alert>

                  <div className="overflow-auto max-h-[400px] border rounded-md">
                    <table className="w-full border-collapse">
                      <thead className="sticky top-0 bg-background shadow-sm z-10">
                        <tr className="bg-muted/50">
                          {Object.keys(systemData[0] || {}).map((key) => (
                            <th key={key} className="p-2 text-left text-xs font-medium text-muted-foreground border">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {systemData.slice(0, 10).map((row, i) => (
                          <tr key={i} className="border-b hover:bg-muted/30 transition-colors">
                            {Object.entries(row).map(([key, value]: [string, any], j) => (
                              <td key={j} className="p-2 text-xs border">
                                {value?.toString() || ""}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={() => analyzeTabRef.current?.click()}>Ir a Análisis</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Alert>
                    <AlertTitle>No hay datos disponibles</AlertTitle>
                    <AlertDescription>
                      No se encontraron datos en el sistema. Puedes cargar un archivo CSV en la pestaña "Cargar Datos" o
                      utilizar la URL predeterminada.
                    </AlertDescription>
                  </Alert>
                  <Button onClick={loadSystemData} variant="outline">
                    <Database className="mr-2 h-4 w-4" />
                    Cargar datos del sistema
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="explore">
          {csvData ? (
            <DataExplorer data={csvData} />
          ) : (
            <EmptyState
              title="No hay datos para explorar"
              description="Carga un archivo CSV con datos electorales para comenzar a explorarlos."
              icon={<FileSpreadsheet className="h-10 w-10 text-primary/40" />}
              actionLabel="Cargar Datos"
              action={() => {
                const uploadTab = document.querySelector('[data-value="upload"]') as HTMLElement
                if (uploadTab) uploadTab.click()
              }}
            />
          )}
        </TabsContent>

        <TabsContent value="analyze">
          {csvData ? (
            <ElectionAnalyzer data={csvData} />
          ) : (
            <EmptyState
              title="No hay datos para analizar"
              description="Carga un archivo CSV con datos electorales para comenzar el análisis."
              icon={<PieChart className="h-10 w-10 text-primary/40" />}
              actionLabel="Cargar Datos"
              action={() => {
                const uploadTab = document.querySelector('[data-value="upload"]') as HTMLElement
                if (uploadTab) uploadTab.click()
              }}
            />
          )}
        </TabsContent>

        <TabsContent value="map">
          {csvData ? (
            <SectionMap data={csvData} />
          ) : (
            <EmptyState
              title="No hay datos para visualizar en el mapa"
              description="Carga un archivo CSV con datos electorales para visualizarlos geográficamente."
              icon={<Map className="h-10 w-10 text-primary/40" />}
              actionLabel="Cargar Datos"
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

"use client"

import { useState, useCallback, useRef } from "react"
import { ElectionAnalyzer } from "@/components/metasresultados/election-analyzer"
import { CsvUploader } from "@/components/metasresultados/csv-uploader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataExplorer } from "@/components/metasresultados/data-explorer"
import { SectionMap } from "@/components/metasresultados/section-map"
import { EmptyState } from "@/components/metasresultados/empty-state"
import { FileSpreadsheet, Map, PieChart } from "lucide-react"
import { DashboardShell } from "@/components/ui/dashboard-shell"
import { PageHeader } from "@/components/ui/page-header"
import { useToast } from "@/components/ui/use-toast"

export default function MetasResultadosPage() {
  const [csvData, setCsvData] = useState<any[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const analyzeTabRef = useRef<HTMLButtonElement>(null)

  // URL del archivo CSV predeterminado
  const defaultCsvUrl =
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/resultados%20presidencia-LVfPZagSB0isuIwJ3Xn13J2rtja6Po.csv"

  const handleDataLoaded = useCallback(
    (data: any[]) => {
      setCsvData(data)
      setError(null)
      toast({
        title: "Datos cargados correctamente",
        description: `Se han cargado ${data.length} registros`,
        duration: 3000,
      })

      // Cambiar automáticamente a la pestaña de análisis
      setTimeout(() => {
        analyzeTabRef.current?.click()
      }, 500)
    },
    [toast],
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

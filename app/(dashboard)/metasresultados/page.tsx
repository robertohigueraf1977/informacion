"use client"

import { useState } from "react"
import { ElectionAnalyzer } from "@/components/metasresultados/election-analyzer"
import { CsvUploader } from "@/components/metasresultados/csv-uploader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataExplorer } from "@/components/metasresultados/data-explorer"

export default function MetasResultadosPage() {
  const [csvData, setCsvData] = useState<any[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // URL del archivo CSV predeterminado
  const defaultCsvUrl =
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/resultados%20presidencia-LVfPZagSB0isuIwJ3Xn13J2rtja6Po.csv"

  const handleDataLoaded = (data: any[]) => {
    setCsvData(data)
    setError(null)
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
    setCsvData(null)
  }

  const handleLoadingChange = (loading: boolean) => {
    setIsLoading(loading)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Metas y Resultados Electorales</h1>
        <p className="text-muted-foreground">Analiza resultados electorales y establece estrategias de campaña</p>
      </div>

      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upload">Cargar Datos</TabsTrigger>
          <TabsTrigger value="explore" disabled={!csvData}>
            Explorar Datos
          </TabsTrigger>
          <TabsTrigger value="analyze" disabled={!csvData}>
            Análisis Electoral
          </TabsTrigger>
          <TabsTrigger value="strategy" disabled={!csvData}>
            Estrategia de Campaña
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cargar Archivo CSV</CardTitle>
              <CardDescription>
                Sube un archivo CSV con datos electorales o utiliza el archivo predeterminado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CsvUploader
                defaultUrl={defaultCsvUrl}
                onDataLoaded={handleDataLoaded}
                onError={handleError}
                onLoadingChange={handleLoadingChange}
              />

              {error && (
                <div className="mt-4 p-4 bg-destructive/10 border border-destructive rounded-md">
                  <p className="text-destructive font-medium">Error: {error}</p>
                </div>
              )}

              {csvData && !error && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-green-700 font-medium">Datos cargados correctamente: {csvData.length} registros</p>
                </div>
              )}
            </CardContent>
          </Card>

          {csvData && (
            <Card>
              <CardHeader>
                <CardTitle>Vista previa de datos</CardTitle>
                <CardDescription>Primeros 5 registros del archivo cargado</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted">
                        {Object.keys(csvData[0] || {}).map((key) => (
                          <th key={key} className="p-2 text-left text-xs font-medium text-muted-foreground border">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.slice(0, 5).map((row, i) => (
                        <tr key={i} className="border-b hover:bg-muted/50">
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

        <TabsContent value="explore">{csvData && <DataExplorer data={csvData} />}</TabsContent>

        <TabsContent value="analyze">{csvData && <ElectionAnalyzer data={csvData} />}</TabsContent>

        <TabsContent value="strategy">
          {csvData && (
            <Card>
              <CardHeader>
                <CardTitle>Estrategia de Campaña</CardTitle>
                <CardDescription>
                  Herramientas para planificar estrategias basadas en los datos electorales
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Esta sección está en desarrollo. Próximamente disponible.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

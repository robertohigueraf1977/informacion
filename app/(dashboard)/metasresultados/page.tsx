"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Upload, FileText, BarChart3, Map, TrendingUp, Database, AlertCircle, CheckCircle } from "lucide-react"
import { ElectoralDashboard } from "@/components/metasresultados/electoral-dashboard"

export default function MetasResultadosPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [fileInfo, setFileInfo] = useState<any>(null)
  const { toast } = useToast()

  // URL de datos de ejemplo
  const EXAMPLE_CSV_URL =
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/resultados%20presidencia-LVfPZagSB0isuIwJ3Xn13J2rtja6Po.csv"

  const parseCSV = useCallback((csvText: string) => {
    const lines = csvText.trim().split("\n")
    if (lines.length < 2) {
      throw new Error("El archivo CSV debe tener al menos encabezados y una fila de datos")
    }

    // Parsear encabezados
    const headers = lines[0].split(",").map((h) => h.trim().replace(/['"]/g, ""))

    // Parsear datos
    const data = []
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      const values = line.split(",").map((v) => v.trim().replace(/['"]/g, ""))

      if (values.length === headers.length) {
        const row: any = {}
        headers.forEach((header, index) => {
          const value = values[index]

          // Convertir números
          if (value && !isNaN(Number(value))) {
            row[header] = Number(value)
          } else {
            row[header] = value || ""
          }
        })
        data.push(row)
      }
    }

    return data
  }, [])

  const processData = useCallback((rawData: any[]) => {
    if (!rawData || rawData.length === 0) return []

    return rawData.map((row) => {
      // Normalizar nombres de columnas
      const normalizedRow: any = {}

      Object.keys(row).forEach((key) => {
        const normalizedKey = key.toUpperCase().trim()
        normalizedRow[normalizedKey] = row[key]
      })

      // Mapear DISTRITO_L y DISTRITO_F
      if (normalizedRow.DISTRITO_L) {
        normalizedRow.DISTRITO_LOCAL = normalizedRow.DISTRITO_L
      }
      if (normalizedRow.DISTRITO_F) {
        normalizedRow.DISTRITO_FEDERAL = normalizedRow.DISTRITO_F
      }

      // Asegurar que tenemos las columnas básicas
      if (!normalizedRow.SECCION && normalizedRow.SECCIÓN) {
        normalizedRow.SECCION = normalizedRow.SECCIÓN
      }
      if (!normalizedRow.MUNICIPIO && normalizedRow.MUNICIPIO) {
        normalizedRow.MUNICIPIO = normalizedRow.MUNICIPIO
      }

      return normalizedRow
    })
  }, [])

  const validateData = useCallback((data: any[]) => {
    if (!data || data.length === 0) {
      return { isValid: false, message: "No hay datos para validar" }
    }

    const firstRow = data[0]
    const columns = Object.keys(firstRow)

    // Verificar columnas esenciales
    const hasSeccion = columns.some((col) => col.toUpperCase().includes("SECCION"))
    const hasMunicipio = columns.some((col) => col.toUpperCase().includes("MUNICIPIO"))
    const hasVotes = columns.some((col) =>
      ["PAN", "PRI", "PRD", "MORENA", "MC", "PT", "PVEM"].some((party) => col.toUpperCase().includes(party)),
    )

    if (!hasSeccion) {
      return { isValid: false, message: "Falta la columna SECCION" }
    }
    if (!hasMunicipio) {
      return { isValid: false, message: "Falta la columna MUNICIPIO" }
    }
    if (!hasVotes) {
      return { isValid: false, message: "No se encontraron columnas de partidos políticos" }
    }

    return { isValid: true, message: "Datos válidos" }
  }, [])

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      if (!file.name.toLowerCase().endsWith(".csv")) {
        setError("Por favor selecciona un archivo CSV")
        return
      }

      setLoading(true)
      setError(null)
      setUploadProgress(0)

      try {
        // Simular progreso
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 10, 90))
        }, 100)

        const text = await file.text()
        clearInterval(progressInterval)
        setUploadProgress(95)

        const rawData = parseCSV(text)
        const processedData = processData(rawData)

        const validation = validateData(processedData)
        if (!validation.isValid) {
          throw new Error(validation.message)
        }

        setFileInfo({
          name: file.name,
          size: file.size,
          rows: processedData.length,
          columns: Object.keys(processedData[0] || {}).length,
        })

        setData(processedData)
        setUploadProgress(100)

        toast({
          title: "Archivo cargado exitosamente",
          description: `${processedData.length} registros procesados`,
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Error desconocido"
        setError(errorMessage)
        toast({
          title: "Error al cargar archivo",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
        setTimeout(() => setUploadProgress(0), 2000)
      }
    },
    [parseCSV, processData, validateData, toast],
  )

  const handleUrlLoad = useCallback(
    async (url: string) => {
      if (!url.trim()) {
        setError("Por favor ingresa una URL válida")
        return
      }

      setLoading(true)
      setError(null)
      setUploadProgress(0)

      try {
        setUploadProgress(25)
        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`)
        }

        setUploadProgress(50)
        const text = await response.text()

        setUploadProgress(75)
        const rawData = parseCSV(text)
        const processedData = processData(rawData)

        const validation = validateData(processedData)
        if (!validation.isValid) {
          throw new Error(validation.message)
        }

        setFileInfo({
          name: "Datos desde URL",
          size: text.length,
          rows: processedData.length,
          columns: Object.keys(processedData[0] || {}).length,
        })

        setData(processedData)
        setUploadProgress(100)

        toast({
          title: "Datos cargados desde URL",
          description: `${processedData.length} registros procesados`,
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Error desconocido"
        setError(errorMessage)
        toast({
          title: "Error al cargar desde URL",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
        setTimeout(() => setUploadProgress(0), 2000)
      }
    },
    [parseCSV, processData, validateData, toast],
  )

  const loadExampleData = useCallback(() => {
    handleUrlLoad(EXAMPLE_CSV_URL)
  }, [handleUrlLoad])

  const clearData = useCallback(() => {
    setData([])
    setFileInfo(null)
    setError(null)
    setUploadProgress(0)
  }, [])

  // Si hay datos, mostrar el dashboard
  if (data.length > 0) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Análisis Electoral - Metas y Resultados</h1>
            <p className="text-gray-600">
              {fileInfo?.rows.toLocaleString()} registros • {fileInfo?.columns} columnas
            </p>
          </div>
          <Button onClick={clearData} variant="outline">
            Cargar nuevos datos
          </Button>
        </div>

        <ElectoralDashboard data={data} />
      </div>
    )
  }

  // Pantalla de carga de datos
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Metas y Resultados Electorales</h1>
        <p className="text-gray-600">Carga datos electorales para análisis estadístico y visualización</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Cargar Datos Electorales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="example" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="example">Datos de Ejemplo</TabsTrigger>
                <TabsTrigger value="file">Archivo Local</TabsTrigger>
                <TabsTrigger value="url">Desde URL</TabsTrigger>
              </TabsList>

              <TabsContent value="example" className="space-y-4">
                <div className="text-center space-y-4">
                  <div className="p-6 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                    <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Datos de Ejemplo - Elecciones Presidenciales</h3>
                    <p className="text-muted-foreground mb-4">
                      Carga datos de ejemplo con resultados electorales reales para probar el sistema
                    </p>
                    <Button onClick={loadExampleData} disabled={loading} size="lg" className="w-full max-w-md">
                      {loading ? (
                        <>
                          <Database className="h-4 w-4 mr-2 animate-spin" />
                          Cargando...
                        </>
                      ) : (
                        <>
                          <Database className="h-4 w-4 mr-2" />
                          Cargar Datos de Ejemplo
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="file" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="file-upload">Seleccionar archivo CSV</Label>
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      disabled={loading}
                      className="mt-2"
                    />
                  </div>

                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Formato esperado:</strong> CSV con columnas SECCION, MUNICIPIO, DISTRITO_L (Distrito
                      Local), DISTRITO_F (Distrito Federal), LISTA_NOMINAL y columnas de partidos (PAN, PRI, PRD,
                      MORENA, etc.)
                    </AlertDescription>
                  </Alert>
                </div>
              </TabsContent>

              <TabsContent value="url" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="csv-url">URL del archivo CSV</Label>
                    <div className="flex gap-2 mt-2">
                      <Input id="csv-url" type="url" placeholder="https://ejemplo.com/datos.csv" disabled={loading} />
                      <Button
                        onClick={(e) => {
                          const input = (e.target as HTMLElement).parentElement?.querySelector(
                            "input",
                          ) as HTMLInputElement
                          if (input?.value) {
                            handleUrlLoad(input.value)
                          }
                        }}
                        disabled={loading}
                        variant="outline"
                      >
                        Cargar
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Barra de progreso */}
            {uploadProgress > 0 && (
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Procesando datos...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            {/* Error */}
            {error && (
              <Alert variant="destructive" className="mt-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Información del archivo */}
            {fileInfo && !error && (
              <Alert className="mt-6">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Archivo procesado:</strong> {fileInfo.name} •{fileInfo.rows.toLocaleString()} filas •
                  {fileInfo.columns} columnas •{(fileInfo.size / 1024).toFixed(1)} KB
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Información del sistema */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold">Análisis Estadístico</h3>
                  <p className="text-sm text-muted-foreground">
                    Resultados por partido, márgenes de victoria, competitividad
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <Map className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="font-semibold">Visualización Geográfica</h3>
                  <p className="text-sm text-muted-foreground">Mapas por sección, filtros por municipio y distrito</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div>
                  <h3 className="font-semibold">Metas y Proyecciones</h3>
                  <p className="text-sm text-muted-foreground">Análisis de tendencias y establecimiento de objetivos</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

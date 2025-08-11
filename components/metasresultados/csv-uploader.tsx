"use client"

import { useState, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText, Link, CheckCircle, AlertCircle, Download } from 'lucide-react'

interface CsvUploaderProps {
  onDataLoad: (data: any[]) => void
  onError: (error: string) => void
  onLoadingChange: (loading: boolean) => void
  expectedColumns?: string[]
}

// URL del archivo CSV predeterminado con datos de ejemplo
const DEFAULT_CSV_URL = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/resultados%20presidencia-LVfPZagSB0isuIwJ3Xn13J2rtja6Po.csv"

// Partidos mexicanos esperados
const MEXICAN_PARTIES = [
  'PAN', 'PVEM_PT', 'PRI', 'PVEM', 'NO_REGISTRADAS', 'NULOS', 'PT', 'MC', 'PRD',
  'PAN-PRI-PRD', 'PAN-PRI', 'PAN-PRD', 'PRI-PRD', 'PVEM_PT_MORENA', 'PVEM_MORENA',
  'PT_MORENA', 'MORENA'
]

export function CsvUploader({
  onDataLoad,
  onError,
  onLoadingChange,
  expectedColumns = []
}: CsvUploaderProps) {
  const [csvUrl, setCsvUrl] = useState(DEFAULT_CSV_URL)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [validationResults, setValidationResults] = useState<{
    isValid: boolean
    foundColumns: string[]
    missingColumns: string[]
    extraColumns: string[]
    totalRows: number
    sampleData: any[]
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const parseCSV = useCallback((csvText: string) => {
    const lines = csvText.trim().split('\n')
    if (lines.length < 2) {
      throw new Error('El archivo CSV debe tener al menos una fila de encabezados y una fila de datos')
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    const data = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
      if (values.length === headers.length) {
        const row: any = {}
        headers.forEach((header, index) => {
          const value = values[index]
          // Convertir números
          if (!isNaN(Number(value)) && value !== '') {
            row[header] = Number(value)
          } else {
            row[header] = value
          }
        })
        data.push(row)
      }
    }

    return data
  }, [])

  const validateData = useCallback((data: any[]) => {
    if (!data || data.length === 0) {
      return {
        isValid: false,
        foundColumns: [],
        missingColumns: MEXICAN_PARTIES,
        extraColumns: [],
        totalRows: 0,
        sampleData: []
      }
    }

    const foundColumns = Object.keys(data[0])
    const foundParties = foundColumns.filter(col => MEXICAN_PARTIES.includes(col))
    const missingParties = MEXICAN_PARTIES.filter(party => !foundColumns.includes(party))
    const extraColumns = foundColumns.filter(col =>
      !MEXICAN_PARTIES.includes(col) &&
      !['SECCION', 'MUNICIPIO', 'DISTRITO', 'LISTA_NOMINAL', 'CASILLA'].includes(col)
    )

    // Verificar que tenga al menos algunos partidos y columnas básicas
    const hasBasicColumns = foundColumns.includes('SECCION') || foundColumns.includes('seccion')
    const hasParties = foundParties.length >= 3 // Al menos 3 partidos

    return {
      isValid: hasBasicColumns && hasParties,
      foundColumns,
      missingColumns: missingParties,
      extraColumns,
      totalRows: data.length,
      sampleData: data.slice(0, 3)
    }
  }, [])

  const processFile = useCallback(async (file: File) => {
    onLoadingChange(true)
    setUploadProgress(0)
    setValidationResults(null)

    try {
      const text = await file.text()
      setUploadProgress(50)

      const data = parseCSV(text)
      setUploadProgress(75)

      const validation = validateData(data)
      setValidationResults(validation)
      setUploadProgress(100)

      if (validation.isValid) {
        onDataLoad(data)
      } else {
        onError(`Archivo CSV inválido. Faltan columnas importantes o no tiene el formato esperado.`)
      }
    } catch (error) {
      onError(`Error al procesar el archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      onLoadingChange(false)
      setTimeout(() => setUploadProgress(0), 2000)
    }
  }, [parseCSV, validateData, onDataLoad, onError, onLoadingChange])

  const processUrl = useCallback(async (url: string) => {
    onLoadingChange(true)
    setUploadProgress(0)
    setValidationResults(null)

    try {
      setUploadProgress(25)
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Error al cargar el archivo: ${response.status} ${response.statusText}`)
      }

      setUploadProgress(50)
      const text = await response.text()

      setUploadProgress(75)
      const data = parseCSV(text)

      const validation = validateData(data)
      setValidationResults(validation)
      setUploadProgress(100)

      if (validation.isValid) {
        onDataLoad(data)
      } else {
        onError(`URL CSV inválida. El archivo no tiene el formato esperado para datos electorales mexicanos.`)
      }
    } catch (error) {
      onError(`Error al cargar desde URL: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      onLoadingChange(false)
      setTimeout(() => setUploadProgress(0), 2000)
    }
  }, [parseCSV, validateData, onDataLoad, onError, onLoadingChange])

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        onError('Por favor selecciona un archivo CSV válido')
        return
      }
      processFile(file)
    }
  }, [processFile, onError])

  const handleUrlLoad = useCallback(() => {
    if (!csvUrl.trim()) {
      onError('Por favor ingresa una URL válida')
      return
    }
    processUrl(csvUrl)
  }, [csvUrl, processUrl, onError])

  const loadDefaultData = useCallback(() => {
    processUrl(DEFAULT_CSV_URL)
  }, [processUrl])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Cargar Datos Electorales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="url" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="url">URL / Ejemplo</TabsTrigger>
              <TabsTrigger value="file">Archivo Local</TabsTrigger>
              <TabsTrigger value="info">Información</TabsTrigger>
            </TabsList>

            <TabsContent value="url" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="csv-url">URL del archivo CSV</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="csv-url"
                      type="url"
                      placeholder="https://ejemplo.com/datos.csv"
                      value={csvUrl}
                      onChange={(e) => setCsvUrl(e.target.value)}
                    />
                    <Button onClick={handleUrlLoad} variant="outline">
                      <Link className="h-4 w-4 mr-2" />
                      Cargar
                    </Button>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button onClick={loadDefaultData} className="w-full max-w-md">
                    <Download className="h-4 w-4 mr-2" />
                    Cargar Datos de Ejemplo (Resultados Presidenciales)
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="file" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="csv-file">Seleccionar archivo CSV</Label>
                  <Input
                    id="csv-file"
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    ref={fileInputRef}
                    className="mt-2"
                  />
                </div>

                <div className="text-center">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="w-full max-w-md"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Seleccionar Archivo CSV
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="info" className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Formato esperado del CSV:</strong>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• <strong>SECCION:</strong> Número de sección electoral</li>
                    <li>• <strong>MUNICIPIO:</strong> Nombre del municipio</li>
                    <li>• <strong>DISTRITO:</strong> Número del distrito</li>
                    <li>• <strong>LISTA_NOMINAL:</strong> Total de electores registrados</li>
                    <li>• <strong>Partidos:</strong> PAN, PRI, PRD, MORENA, MC, PT, PVEM, etc.</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {MEXICAN_PARTIES.slice(0, 8).map(party => (
                  <Badge key={party} variant="outline" className="justify-center">
                    {party}
                  </Badge>
                ))}
              </div>

              <p className="text-sm text-muted-foreground">
                El sistema está optimizado para datos electorales mexicanos con partidos y coaliciones oficiales.
              </p>
            </TabsContent>
          </Tabs>

          {/* Barra de progreso */}
          {uploadProgress > 0 && (
            <div className="mt-4">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-muted-foreground mt-2">
                Procesando datos... {uploadProgress}%
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resultados de validación */}
      {validationResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {validationResults.isValid ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              Validación de Datos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center p-3 bg-muted/30 rounded">
                  <div className="font-bold text-lg">{validationResults.totalRows}</div>
                  <div className="text-muted-foreground">Filas de datos</div>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded">
                  <div className="font-bold text-lg">{validationResults.foundColumns.length}</div>
                  <div className="text-muted-foreground">Columnas encontradas</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded">
                  <div className="font-bold text-lg text-green-600">
                    {MEXICAN_PARTIES.length - validationResults.missingColumns.length}
                  </div>
                  <div className="text-muted-foreground">Partidos encontrados</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded">
                  <div className="font-bold text-lg text-red-600">{validationResults.missingColumns.length}</div>
                  <div className="text-muted-foreground">Partidos faltantes</div>
                </div>
              </div>

              {validationResults.missingColumns.length > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Partidos faltantes:</strong> {validationResults.missingColumns.join(', ')}
                  </AlertDescription>
                </Alert>
              )}

              {validationResults.isValid && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    ✅ Datos cargados correctamente. El archivo contiene {validationResults.totalRows} registros
                    con {MEXICAN_PARTIES.length - validationResults.missingColumns.length} partidos/coaliciones detectados.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText, Database, AlertCircle, Settings, CheckCircle2, XCircle, Info, Download } from "lucide-react"
import Papa from "papaparse"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { CardSpotlight } from "@/components/ui/card-spotlight"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface CsvUploaderProps {
  defaultUrl?: string
  onDataLoaded: (data: any[]) => void
  onError: (error: string) => void
  onLoadingChange: (loading: boolean) => void
}

export function CsvUploader({ defaultUrl, onDataLoaded, onError, onLoadingChange }: CsvUploaderProps) {
  const [progress, setProgress] = useState(0)
  const [uploadTab, setUploadTab] = useState<string>("file")
  const [url, setUrl] = useState(defaultUrl || "")
  const [error, setError] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [warnings, setWarnings] = useState<string[]>([])

  // Opciones avanzadas para el parsing - configuradas para la estructura electoral específica
  const [delimiter, setDelimiter] = useState<string>(",") // Coma por defecto según el esquema
  const [encoding, setEncoding] = useState<string>("UTF-8")
  const [skipEmptyLines, setSkipEmptyLines] = useState<boolean>(true)
  const [forceProcess, setForceProcess] = useState<boolean>(false)
  const [headerRow, setHeaderRow] = useState<boolean>(true)
  const [previewData, setPreviewData] = useState<string | null>(null)

  // Estructura esperada según el esquema proporcionado
  const expectedColumns = [
    "DISTRITO_F",
    "DISTRITO_L",
    "MUNICIPIO",
    "SECCION",
    "PAN",
    "LISTA_NOMINAL",
    "PVEM_PT",
    "PRI",
    "PVEM",
    "NO_REGISTRADAS",
    "NULOS",
    "PT",
    "MC",
    "PRD",
    "PAN-PRI-PRD",
    "PAN-PRI",
    "PAN-PRD",
    "PRI-PRD",
    "PVEM_PT_MORENA",
    "PVEM_MORENA",
    "PT_MORENA",
    "MORENA",
  ]

  // Función para procesar el CSV con las opciones configuradas
  const processCsvData = (csvText: string, source: string) => {
    if (!csvText || csvText.trim() === "") {
      setError("El archivo está vacío")
      onError("El archivo está vacío")
      onLoadingChange(false)
      setIsSuccess(false)
      return
    }

    // Mostrar una vista previa de los primeros 500 caracteres
    setPreviewData(csvText.substring(0, 500) + (csvText.length > 500 ? "..." : ""))

    // Configurar opciones de parsing para datos electorales
    const parseOptions: Papa.ParseConfig = {
      header: headerRow,
      dynamicTyping: false, // Mantener como string para control manual
      skipEmptyLines: skipEmptyLines,
      delimiter: delimiter === "auto" ? undefined : delimiter,
      transformHeader: (header) => header.trim().toUpperCase(),
      encoding: encoding,
      transform: (value, field) => {
        // Limpiar valores antes de convertir
        if (typeof value === "string") {
          value = value.trim()
        }

        // Convertir números para campos numéricos específicos
        if (field && isNumericField(field) && value !== "" && value !== "-" && !isNaN(Number(value))) {
          return Number(value)
        }

        return value
      },
      complete: (results) => {
        console.log("Resultados del parsing electoral:", results)

        if (results.errors.length > 0) {
          console.error("Errores de parsing:", results.errors)
          setError(`Error al procesar el archivo: ${results.errors[0].message}`)
          onError(`Error al procesar el archivo: ${results.errors[0].message}`)
          setIsSuccess(false)
        } else if (!results.data || results.data.length === 0) {
          setError("El archivo no contiene datos válidos")
          onError("El archivo no contiene datos válidos")
          setIsSuccess(false)
        } else {
          // Validar estructura de datos electorales
          const validationResult = validateElectoralData(results.data as any[])

          if (!validationResult.isValid && !forceProcess) {
            setError(`Estructura de datos inválida: ${validationResult.errors.join(", ")}`)
            onError(`Estructura de datos inválida: ${validationResult.errors.join(", ")}`)
            setIsSuccess(false)
            setWarnings(validationResult.warnings)
          } else {
            // Procesar y normalizar los datos
            const processedData = normalizeElectoralData(results.data as any[])

            setWarnings(validationResult.warnings)
            onDataLoaded(processedData)
            setProgress(100)
            setError(null)
            setIsSuccess(true)
          }
        }
        onLoadingChange(false)
      },
      error: (error) => {
        console.error("Error al procesar el archivo:", error)
        setError(`Error al procesar el archivo: ${error.message}`)
        onError(`Error al procesar el archivo: ${error.message}`)
        onLoadingChange(false)
        setIsSuccess(false)
      },
    }

    // Procesar el CSV
    Papa.parse(csvText, parseOptions)
  }

  // Determinar si un campo debe ser numérico
  const isNumericField = (field: string): boolean => {
    const numericFields = [
      "PAN",
      "LISTA_NOMINAL",
      "PVEM_PT",
      "PRI",
      "PVEM",
      "NO_REGISTRADAS",
      "NULOS",
      "PT",
      "MC",
      "PRD",
      "PAN-PRI-PRD",
      "PAN-PRI",
      "PAN-PRD",
      "PRI-PRD",
      "PVEM_PT_MORENA",
      "PVEM_MORENA",
      "PT_MORENA",
      "MORENA",
    ]
    return numericFields.includes(field)
  }

  // Validar estructura de datos electorales
  const validateElectoralData = (data: any[]) => {
    const errors: string[] = []
    const warnings: string[] = []

    if (data.length === 0) {
      errors.push("No hay datos para procesar")
      return { isValid: false, errors, warnings }
    }

    const firstRow = data[0]
    const columns = Object.keys(firstRow)

    // Verificar columnas esenciales
    const essentialColumns = ["DISTRITO_F", "DISTRITO_L", "MUNICIPIO", "SECCION"]
    const missingEssential = essentialColumns.filter((col) => !columns.includes(col))

    if (missingEssential.length > 0) {
      errors.push(`Faltan columnas esenciales: ${missingEssential.join(", ")}`)
    }

    // Verificar si hay al menos algunos partidos principales
    const mainParties = ["PAN", "PRI", "PRD", "PVEM", "PT", "MC", "MORENA"]
    const foundParties = columns.filter((col) => mainParties.includes(col))

    if (foundParties.length === 0) {
      warnings.push("No se encontraron columnas de partidos políticos principales")
    }

    // Verificar LISTA_NOMINAL
    if (!columns.includes("LISTA_NOMINAL")) {
      warnings.push("No se encontró la columna LISTA_NOMINAL para calcular participación")
    }

    // Verificar coaliciones
    const coalitionColumns = columns.filter((col) => col.includes("-") || col.includes("_"))
    if (coalitionColumns.length === 0) {
      warnings.push("No se encontraron columnas de coaliciones")
    }

    // Verificar categorías especiales
    if (!columns.includes("NO_REGISTRADAS")) {
      warnings.push("No se encontró la columna NO_REGISTRADAS")
    }
    if (!columns.includes("NULOS")) {
      warnings.push("No se encontró la columna NULOS")
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  // Normalizar datos electorales según el esquema
  const normalizeElectoralData = (data: any[]) => {
    return data
      .map((row, index) => {
        const normalizedRow: any = {}

        // Normalizar nombres de columnas y valores
        Object.entries(row).forEach(([key, value]) => {
          const normalizedKey = key.trim().toUpperCase()

          // Convertir valores según el tipo esperado
          if (isNumericField(normalizedKey)) {
            // Para campos numéricos, asegurar que sean números válidos
            if (typeof value === "string" && value.trim() !== "" && !isNaN(Number(value))) {
              normalizedRow[normalizedKey] = Number(value)
            } else if (typeof value === "number") {
              normalizedRow[normalizedKey] = value
            } else {
              normalizedRow[normalizedKey] = 0 // Valor por defecto para campos numéricos
            }
          } else {
            // Para campos de texto (DISTRITO_F, DISTRITO_L, MUNICIPIO, SECCION)
            normalizedRow[normalizedKey] = String(value || "").trim()
          }
        })

        // Validar que los campos esenciales no estén vacíos
        if (
          !normalizedRow.DISTRITO_F ||
          !normalizedRow.DISTRITO_L ||
          !normalizedRow.MUNICIPIO ||
          !normalizedRow.SECCION
        ) {
          console.warn(`Fila ${index + 1}: Faltan datos esenciales`, normalizedRow)
        }

        return normalizedRow
      })
      .filter(
        (row) =>
          // Filtrar filas que tengan al menos los datos básicos
          row.DISTRITO_F && row.DISTRITO_L && row.MUNICIPIO && row.SECCION,
      )
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    onLoadingChange(true)
    setProgress(0)
    setError(null)
    setWarnings([])
    setIsSuccess(false)

    // Leer el archivo como texto
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setFileContent(text)
      setProgress(50)
      processCsvData(text, "file")
    }

    reader.onerror = () => {
      setError("Error al leer el archivo. Inténtalo de nuevo.")
      onError("Error al leer el archivo. Inténtalo de nuevo.")
      onLoadingChange(false)
      setIsSuccess(false)
    }

    reader.readAsText(file, encoding)
  }

  const handleUrlUpload = async () => {
    if (!url) {
      setError("Por favor, introduce una URL válida")
      onError("Por favor, introduce una URL válida")
      setIsSuccess(false)
      return
    }

    onLoadingChange(true)
    setProgress(10)
    setError(null)
    setWarnings([])
    setIsSuccess(false)

    try {
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Error al descargar el archivo: ${response.status} ${response.statusText}`)
      }

      setProgress(50)
      const text = await response.text()
      setFileContent(text)
      setFileName("archivo-desde-url.csv")
      processCsvData(text, "url")
    } catch (error) {
      setError(`Error: ${error instanceof Error ? error.message : "Desconocido"}`)
      onError(`Error: ${error instanceof Error ? error.message : "Desconocido"}`)
      onLoadingChange(false)
      setIsSuccess(false)
    }
  }

  const handleUseDefaultData = async () => {
    if (!defaultUrl) {
      setError("No hay URL predeterminada configurada")
      onError("No hay URL predeterminada configurada")
      setIsSuccess(false)
      return
    }

    setUrl(defaultUrl)
    onLoadingChange(true)
    setProgress(10)
    setError(null)
    setWarnings([])
    setIsSuccess(false)

    try {
      const response = await fetch(defaultUrl)

      if (!response.ok) {
        throw new Error(`Error al descargar el archivo: ${response.status} ${response.statusText}`)
      }

      setProgress(50)
      const text = await response.text()
      setFileContent(text)
      setFileName("resultados-presidencia.csv")
      processCsvData(text, "default")
    } catch (error) {
      setError(`Error: ${error instanceof Error ? error.message : "Desconocido"}`)
      onError(`Error: ${error instanceof Error ? error.message : "Desconocido"}`)
      onLoadingChange(false)
      setIsSuccess(false)
    }
  }

  // Reprocesar el archivo con las nuevas opciones
  const reprocessFile = () => {
    if (fileContent) {
      onLoadingChange(true)
      setProgress(50)
      setWarnings([])
      processCsvData(fileContent, "reprocess")
    } else {
      setError("No hay archivo para procesar. Carga un archivo primero.")
      onError("No hay archivo para procesar. Carga un archivo primero.")
      setIsSuccess(false)
    }
  }

  // Descargar plantilla CSV con la estructura exacta
  const downloadTemplate = () => {
    const templateHeaders = expectedColumns.join(",")
    const sampleRow = [
      "2", // DISTRITO_F
      "7", // DISTRITO_L
      "AGUASCALIENTES", // MUNICIPIO
      "543", // SECCION
      "139", // PAN
      "2389", // LISTA_NOMINAL
      "13", // PVEM_PT
      "21", // PRI
      "48", // PVEM
      "1", // NO_REGISTRADAS
      "34", // NULOS
      "37", // PT
      "72", // MC
      "10", // PRD
      "15", // PAN-PRI-PRD
      "3", // PAN-PRI
      "0", // PAN-PRD
      "1", // PRI-PRD
      "59", // PVEM_PT_MORENA
      "9", // PVEM_MORENA
      "12", // PT_MORENA
      "557", // MORENA
    ].join(",")

    const csvContent = `${templateHeaders}\n${sampleRow}`
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "plantilla_resultados_presidencia.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6 animate-in fade-in-50">
      <Tabs value={uploadTab} onValueChange={setUploadTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger
            value="file"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Subir Archivo
          </TabsTrigger>
          <TabsTrigger
            value="url"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Desde URL
          </TabsTrigger>
          <TabsTrigger
            value="default"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Resultados Presidencia
          </TabsTrigger>
        </TabsList>

        <TabsContent value="file" className="space-y-4 pt-4">
          <CardSpotlight className="flex flex-col items-center justify-center p-10 text-center">
            <div
              className="cursor-pointer flex flex-col items-center justify-center w-full h-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <FileText className="h-10 w-10 text-primary/60" />
              </div>
              <h3 className="font-medium text-lg mb-2">Arrastra y suelta tu archivo CSV</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-md">
                O haz clic aquí para seleccionar un archivo. El archivo debe contener resultados electorales de
                presidencia con la estructura especificada.
              </p>
              <input ref={fileInputRef} type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
              <div className="flex gap-2">
                <Button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Seleccionar Archivo
                </Button>
                <Button onClick={downloadTemplate} variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Descargar Plantilla
                </Button>
              </div>
            </div>
          </CardSpotlight>
        </TabsContent>

        <TabsContent value="url" className="space-y-4 pt-4">
          <CardSpotlight className="p-6">
            <div className="flex flex-col space-y-4">
              <h3 className="font-medium text-lg">Desde URL</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Introduce la URL de un archivo CSV con resultados electorales accesible públicamente
              </p>
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="https://ejemplo.com/resultados-presidencia.csv"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleUrlUpload} className="whitespace-nowrap">
                  Cargar URL
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                La URL debe apuntar directamente a un archivo CSV descargable con resultados electorales.
              </div>
            </div>
          </CardSpotlight>
        </TabsContent>

        <TabsContent value="default" className="space-y-4 pt-4">
          <CardSpotlight className="flex flex-col items-center justify-center p-10 text-center">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Database className="h-10 w-10 text-primary/60" />
            </div>
            <h3 className="font-medium text-lg mb-2">Resultados Presidencia 2024</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              Carga los resultados oficiales de la elección presidencial 2024 para comenzar el análisis electoral.
            </p>
            <div className="text-xs text-muted-foreground mb-4 p-3 bg-blue-50 rounded-md">
              <strong>Archivo:</strong> resultados presidencia.csv
              <br />
              <strong>Estructura:</strong> 22 columnas con datos por distrito, municipio y sección
              <br />
              <strong>Partidos:</strong> PAN, PRI, PRD, PVEM, PT, MC, MORENA + Coaliciones
            </div>
            <Button onClick={handleUseDefaultData} className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Cargar Resultados Presidencia
            </Button>
          </CardSpotlight>
        </TabsContent>
      </Tabs>

      {progress > 0 && (
        <div className="space-y-2 animate-in fade-in-50">
          <div className="flex justify-between text-sm">
            <span>Procesando resultados electorales</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {fileName && (
        <div
          className={`p-4 rounded-lg border animate-in fade-in-50 ${isSuccess ? "bg-green-50 border-green-200" : "bg-muted/30 border-muted"}`}
        >
          <div className="flex items-start gap-3">
            {isSuccess ? (
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
            ) : (
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">Archivo: {fileName}</p>
                {isSuccess && (
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    Cargado correctamente
                  </Badge>
                )}
              </div>

              {isSuccess && (
                <p className="text-xs text-muted-foreground mt-1">
                  Los resultados electorales se han procesado correctamente y están listos para análisis.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {warnings.length > 0 && (
        <Alert className="bg-amber-50 border-amber-200">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Advertencias</AlertTitle>
          <AlertDescription className="text-amber-700">
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Opciones avanzadas */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Opciones avanzadas de importación
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Opciones avanzadas de importación</DialogTitle>
            <DialogDescription>
              Configura estas opciones si tienes problemas al cargar tu archivo CSV con resultados electorales.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="delimiter">Delimitador</Label>
                <Select value={delimiter} onValueChange={setDelimiter}>
                  <SelectTrigger id="delimiter">
                    <SelectValue placeholder="Seleccionar delimitador" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=",">Coma (,) - Recomendado</SelectItem>
                    <SelectItem value="auto">Auto-detectar</SelectItem>
                    <SelectItem value="\t">Tabulación</SelectItem>
                    <SelectItem value=";">Punto y coma (;)</SelectItem>
                    <SelectItem value="|">Barra vertical (|)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="encoding">Codificación</Label>
                <Select value={encoding} onValueChange={setEncoding}>
                  <SelectTrigger id="encoding">
                    <SelectValue placeholder="Seleccionar codificación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTF-8">UTF-8</SelectItem>
                    <SelectItem value="ISO-8859-1">ISO-8859-1 (Latin-1)</SelectItem>
                    <SelectItem value="windows-1252">Windows-1252</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="headerRow"
                  checked={headerRow}
                  onCheckedChange={(checked) => setHeaderRow(checked === true)}
                />
                <Label htmlFor="headerRow">La primera fila contiene encabezados</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="skipEmptyLines"
                  checked={skipEmptyLines}
                  onCheckedChange={(checked) => setSkipEmptyLines(checked === true)}
                />
                <Label htmlFor="skipEmptyLines">Omitir líneas vacías</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="forceProcess"
                  checked={forceProcess}
                  onCheckedChange={(checked) => setForceProcess(checked === true)}
                />
                <Label htmlFor="forceProcess">Forzar procesamiento (ignorar validaciones)</Label>
              </div>
            </div>

            {previewData && (
              <div className="space-y-2">
                <Label>Vista previa del archivo:</Label>
                <div className="bg-muted p-2 rounded-md overflow-auto max-h-[150px] text-xs font-mono whitespace-pre">
                  {previewData}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={reprocessFile} disabled={!fileContent}>
              Procesar con estas opciones
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {error ? (
        <div className="mt-4 space-y-4 animate-in fade-in-50">
          <div className="p-4 bg-destructive/10 border border-destructive rounded-md flex gap-3">
            <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-destructive">Error: {error}</p>
              <p className="text-sm text-destructive/80 mt-1">
                Revisa las soluciones comunes a continuación o utiliza las opciones avanzadas.
              </p>
            </div>
          </div>

          <Accordion type="single" collapsible className="border rounded-md">
            <AccordionItem value="solutions">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <span>Soluciones comunes</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  <li>Asegúrate de que el archivo esté en formato CSV con comas como separadores.</li>
                  <li>Verifica que el archivo tenga los 22 encabezados correctos según el esquema.</li>
                  <li>Comprueba que los datos numéricos sean válidos (sin caracteres especiales).</li>
                  <li>Si el archivo fue exportado desde Excel, guárdalo como "CSV (delimitado por comas)".</li>
                  <li>Descarga la plantilla para ver la estructura exacta esperada.</li>
                  <li>Prueba con diferentes delimitadores en las opciones avanzadas.</li>
                  <li>Como último recurso, activa la opción "Forzar procesamiento".</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      ) : (
        <Accordion type="single" collapsible className="border rounded-md">
          <AccordionItem value="format">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <span>Estructura esperada del archivo</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <p className="text-sm text-muted-foreground mb-3">
                El archivo debe contener exactamente las siguientes 22 columnas:
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <p className="font-medium mb-2 text-foreground">Información geográfica:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      <span className="font-medium">DISTRITO_F</span>: Distrito Federal
                    </li>
                    <li>
                      <span className="font-medium">DISTRITO_L</span>: Distrito Local
                    </li>
                    <li>
                      <span className="font-medium">MUNICIPIO</span>: Nombre del municipio
                    </li>
                    <li>
                      <span className="font-medium">SECCION</span>: Número de sección
                    </li>
                    <li>
                      <span className="font-medium">LISTA_NOMINAL</span>: Votantes registrados
                    </li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium mb-2 text-foreground">Partidos y coaliciones:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      <span className="font-medium">Partidos</span>: PAN, PRI, PRD, PVEM, PT, MC, MORENA
                    </li>
                    <li>
                      <span className="font-medium">Coaliciones</span>: PAN-PRI-PRD, PVEM_PT_MORENA, etc.
                    </li>
                    <li>
                      <span className="font-medium">Especiales</span>: NO_REGISTRADAS, NULOS
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Ejemplo de valores:</strong> DISTRITO_F="2", DISTRITO_L="7", MUNICIPIO="4", SECCION="543",
                  PAN="139", LISTA_NOMINAL="2389", MORENA="557"
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  )
}

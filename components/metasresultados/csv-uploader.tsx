"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText, Database, AlertCircle, Settings, CheckCircle2, XCircle } from "lucide-react"
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

  // Opciones avanzadas para el parsing
  const [delimiter, setDelimiter] = useState<string>("auto")
  const [encoding, setEncoding] = useState<string>("UTF-8")
  const [skipEmptyLines, setSkipEmptyLines] = useState<boolean>(true)
  const [forceProcess, setForceProcess] = useState<boolean>(false)
  const [headerRow, setHeaderRow] = useState<boolean>(true)
  const [previewData, setPreviewData] = useState<string | null>(null)

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

    // Configurar opciones de parsing
    const parseOptions: Papa.ParseConfig = {
      header: headerRow,
      dynamicTyping: true,
      skipEmptyLines: skipEmptyLines,
      transformHeader: (header) => header.trim(),
      encoding: encoding,
      transform: (value, field) => {
        // Limpiar valores antes de convertir
        if (typeof value === "string") {
          value = value.trim()
        }
        // Convert string numbers to actual numbers
        if (field !== "SECCION" && value !== "" && value !== "-" && !isNaN(Number(value))) {
          return Number(value)
        }
        return value
      },
      complete: (results) => {
        console.log("Resultados del parsing:", results)

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
          // Si estamos forzando el procesamiento o los datos parecen válidos
          if (
            forceProcess ||
            (Array.isArray(results.data) &&
              results.data[0] &&
              (headerRow ? Object.keys(results.data[0]).length > 1 : results.data[0].length > 1))
          ) {
            // Si no hay encabezados, crear encabezados genéricos
            let processedData = results.data
            if (!headerRow && Array.isArray(results.data) && results.data.length > 0) {
              const firstRow = results.data[0] as any[]
              const headers = firstRow.map((_, index) => `Column${index + 1}`)

              processedData = results.data.map((row) => {
                const rowObj: Record<string, any> = {}
                ;(row as any[]).forEach((value, index) => {
                  rowObj[headers[index]] = value
                })
                return rowObj
              })
            }

            onDataLoaded(processedData as any[])
            setProgress(100)
            setError(null)
            setIsSuccess(true)
          } else {
            setError("El formato del archivo no es válido. Prueba con las opciones avanzadas.")
            onError("El formato del archivo no es válido. Prueba con las opciones avanzadas.")
            setIsSuccess(false)
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

    // Configurar el delimitador si no es automático
    if (delimiter !== "auto") {
      parseOptions.delimiter = delimiter
    }

    // Procesar el CSV
    Papa.parse(csvText, parseOptions)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    onLoadingChange(true)
    setProgress(0)
    setError(null)
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
    setIsSuccess(false)

    try {
      const response = await fetch(defaultUrl)

      if (!response.ok) {
        throw new Error(`Error al descargar el archivo: ${response.status} ${response.statusText}`)
      }

      setProgress(50)
      const text = await response.text()
      setFileContent(text)
      setFileName("datos-predeterminados.csv")
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
      processCsvData(fileContent, "reprocess")
    } else {
      setError("No hay archivo para procesar. Carga un archivo primero.")
      onError("No hay archivo para procesar. Carga un archivo primero.")
      setIsSuccess(false)
    }
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
            Datos Predeterminados
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
                O haz clic aquí para seleccionar un archivo. El archivo debe contener datos de resultados electorales.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt,.tsv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Seleccionar Archivo
              </Button>
            </div>
          </CardSpotlight>
        </TabsContent>

        <TabsContent value="url" className="space-y-4 pt-4">
          <CardSpotlight className="p-6">
            <div className="flex flex-col space-y-4">
              <h3 className="font-medium text-lg">Desde URL</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Introduce la URL de un archivo CSV acces2ible públicamente
              </p>
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="https://ejemplo.com/datos.csv"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleUrlUpload} className="whitespace-nowrap">
                  Cargar URL
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                La URL debe apuntar directamente a un archivo CSV descargable.
              </div>
            </div>
          </CardSpotlight>
        </TabsContent>

        <TabsContent value="default" className="space-y-4 pt-4">
          <CardSpotlight className="flex flex-col items-center justify-center p-10 text-center">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Database className="h-10 w-10 text-primary/60" />
            </div>
            <h3 className="font-medium text-lg mb-2">Usar datos predeterminados</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              Carga el conjunto de datos de resultados electorales predeterminado para comenzar rápidamente.
            </p>
            <Button onClick={handleUseDefaultData} className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Cargar Datos Predeterminados
            </Button>
          </CardSpotlight>
        </TabsContent>
      </Tabs>

      {progress > 0 && (
        <div className="space-y-2 animate-in fade-in-50">
          <div className="flex justify-between text-sm">
            <span>Procesando archivo</span>
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
                  El archivo se ha procesado correctamente y está listo para su análisis.
                </p>
              )}
            </div>
          </div>
        </div>
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
            <DialogTitle>Opciones avanzadas de importación CSV</DialogTitle>
            <DialogDescription>
              Configura estas opciones si tienes problemas al cargar tu archivo CSV.
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
                    <SelectItem value="auto">Auto-detectar</SelectItem>
                    <SelectItem value=",">Coma (,)</SelectItem>
                    <SelectItem value=";">Punto y coma (;)</SelectItem>
                    <SelectItem value="\t">Tabulación</SelectItem>
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
                  <li>Asegúrate de que el archivo esté en formato CSV (valores separados por comas).</li>
                  <li>Verifica que el archivo tenga un encabezado con los nombres de las columnas.</li>
                  <li>Comprueba que el archivo no esté vacío y contenga datos válidos.</li>
                  <li>Si el archivo fue creado en Excel, guárdalo explícitamente como "CSV (delimitado por comas)".</li>
                  <li>Si el archivo usa punto y coma (;) como separador, selecciónalo en las opciones avanzadas.</li>
                  <li>Prueba con diferentes codificaciones en las opciones avanzadas.</li>
                  <li>Como último recurso, activa la opción "Forzar procesamiento" en las opciones avanzadas.</li>
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
                <span>Formato esperado del CSV</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <p className="text-sm text-muted-foreground mb-2">El archivo debe contener las siguientes columnas:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                <li>
                  <span className="font-medium">SECCION</span>: Identificador de la sección electoral
                </li>
                <li>
                  <span className="font-medium">DISTRITO</span>: Número de distrito
                </li>
                <li>
                  <span className="font-medium">MUNICIPIO</span>: Nombre del municipio
                </li>
                <li>
                  <span className="font-medium">LISTA_NOMINAL</span>: Número de votantes registrados
                </li>
                <li>
                  <span className="font-medium">Partidos políticos</span> (PAN, PRI, PRD, etc.): Votos por partido
                </li>
                <li>
                  <span className="font-medium">Coaliciones</span> (PAN-PRI-PRD, etc.): Votos por coalición
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  )
}

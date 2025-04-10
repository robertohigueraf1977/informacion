"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText, Database, AlertCircle } from "lucide-react"
import Papa from "papaparse"

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
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    onLoadingChange(true)
    setProgress(0)

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      transform: (value, field) => {
        // Convert string numbers to actual numbers
        if (field !== "SECCION" && value !== "" && value !== "-" && !isNaN(Number(value))) {
          return Number(value)
        }
        return value
      },
      step: (results, parser) => {
        // Actualizar progreso basado en bytes procesados
        if (file.size > 0) {
          const progress = Math.round((parser.streamer._input.length / file.size) * 100)
          setProgress(progress > 100 ? 100 : progress)
        }
      },
      complete: (results) => {
        if (results.errors.length > 0) {
          onError(`Error al procesar el archivo: ${results.errors[0].message}`)
        } else if (results.data.length === 0) {
          onError("El archivo no contiene datos válidos")
        } else {
          onDataLoaded(results.data as any[])
          setProgress(100)
        }
        onLoadingChange(false)
      },
      error: (error) => {
        onError(`Error al procesar el archivo: ${error.message}`)
        onLoadingChange(false)
      },
    })
  }

  const handleUrlUpload = async () => {
    if (!url) {
      onError("Por favor, introduce una URL válida")
      return
    }

    onLoadingChange(true)
    setProgress(10)

    try {
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Error al descargar el archivo: ${response.status} ${response.statusText}`)
      }

      setProgress(50)
      const text = await response.text()
      setProgress(70)

      Papa.parse(text, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
        transform: (value, field) => {
          // Convert string numbers to actual numbers
          if (field !== "SECCION" && value !== "" && value !== "-" && !isNaN(Number(value))) {
            return Number(value)
          }
          return value
        },
        complete: (results) => {
          if (results.errors.length > 0) {
            onError(`Error al procesar el archivo: ${results.errors[0].message}`)
          } else if (results.data.length === 0) {
            onError("El archivo no contiene datos válidos")
          } else {
            onDataLoaded(results.data as any[])
            setProgress(100)
          }
          onLoadingChange(false)
        },
        error: (error) => {
          onError(`Error al procesar el archivo: ${error.message}`)
          onLoadingChange(false)
        },
      })
    } catch (error) {
      onError(`Error: ${error instanceof Error ? error.message : "Desconocido"}`)
      onLoadingChange(false)
    }
  }

  const handleUseDefaultData = async () => {
    if (!defaultUrl) {
      onError("No hay URL predeterminada configurada")
      return
    }

    setUrl(defaultUrl)
    onLoadingChange(true)
    setProgress(10)

    try {
      const response = await fetch(defaultUrl)

      if (!response.ok) {
        throw new Error(`Error al descargar el archivo: ${response.status} ${response.statusText}`)
      }

      setProgress(50)
      const text = await response.text()
      setProgress(70)

      Papa.parse(text, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
        transform: (value, field) => {
          // Convert string numbers to actual numbers
          if (field !== "SECCION" && value !== "" && value !== "-" && !isNaN(Number(value))) {
            return Number(value)
          }
          return value
        },
        complete: (results) => {
          if (results.errors.length > 0) {
            onError(`Error al procesar el archivo: ${results.errors[0].message}`)
          } else if (results.data.length === 0) {
            onError("El archivo no contiene datos válidos")
          } else {
            onDataLoaded(results.data as any[])
            setProgress(100)
          }
          onLoadingChange(false)
        },
        error: (error) => {
          onError(`Error al procesar el archivo: ${error.message}`)
          onLoadingChange(false)
        },
      })
    } catch (error) {
      onError(`Error: ${error instanceof Error ? error.message : "Desconocido"}`)
      onLoadingChange(false)
    }
  }

  return (
    <div className="space-y-4">
      <Tabs value={uploadTab} onValueChange={setUploadTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="file">Subir Archivo</TabsTrigger>
          <TabsTrigger value="url">Desde URL</TabsTrigger>
          <TabsTrigger value="default">Datos Predeterminados</TabsTrigger>
        </TabsList>

        <TabsContent value="file" className="space-y-4">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center">
            <FileText className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="font-medium text-lg mb-2">Arrastra y suelta tu archivo CSV</h3>
            <p className="text-sm text-muted-foreground mb-4">O haz clic en el botón para seleccionar un archivo</p>
            <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            <Button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Seleccionar Archivo
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="url" className="space-y-4">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <Input placeholder="https://ejemplo.com/datos.csv" value={url} onChange={(e) => setUrl(e.target.value)} />
              <Button onClick={handleUrlUpload}>Cargar</Button>
            </div>
            <p className="text-sm text-muted-foreground">Introduce la URL de un archivo CSV accesible públicamente</p>
          </div>
        </TabsContent>

        <TabsContent value="default" className="space-y-4">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center">
            <Database className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="font-medium text-lg mb-2">Usar datos predeterminados</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Carga el conjunto de datos de resultados electorales predeterminado
            </p>
            <Button onClick={handleUseDefaultData}>Cargar Datos Predeterminados</Button>
          </div>
        </TabsContent>
      </Tabs>

      {progress > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progreso</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      <div className="bg-muted/50 p-4 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <h4 className="font-medium">Formato esperado del CSV</h4>
            <p className="text-sm text-muted-foreground mt-1">
              El archivo debe contener columnas para SECCION, partidos políticos (PAN, PRI, PRD, etc.), coaliciones y
              LISTA_NOMINAL. Cada fila representa una sección electoral.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

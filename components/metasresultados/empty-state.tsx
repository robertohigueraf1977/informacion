"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileSpreadsheet, Upload, Download, Info } from 'lucide-react'

interface EmptyStateProps {
  onFileSelect?: () => void
}

export function EmptyState({ onFileSelect }: EmptyStateProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6" />
            Bienvenido al Analizador Electoral
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-6">
            <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
              <FileSpreadsheet className="h-12 w-12 text-primary" />
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">
                Comienza tu análisis electoral
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Carga un archivo CSV con datos electorales mexicanos para comenzar a analizar
                resultados, generar gráficos y establecer estrategias de campaña.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={onFileSelect} size="lg" className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Cargar Archivo CSV
              </Button>
              <Button variant="outline" size="lg" className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Usar Datos de Ejemplo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Sistema optimizado para México:</strong> El analizador está configurado para trabajar
          con partidos y coaliciones mexicanos (PAN, PRI, PRD, MORENA, MC, PT, PVEM, etc.) y
          proporciona análisis específicos para el sistema electoral mexicano.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>¿Qué puedes hacer?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">📊 Análisis Completo</h4>
              <p className="text-sm text-muted-foreground">
                Obtén estadísticas detalladas, identifica ganadores y perdedores,
                analiza márgenes de victoria y competitividad.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">🗺️ Visualización Geográfica</h4>
              <p className="text-sm text-muted-foreground">
                Visualiza resultados en mapas interactivos con colores oficiales
                de partidos y filtros por municipio, distrito y sección.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">📈 Gráficos Interactivos</h4>
              <p className="text-sm text-muted-foreground">
                Genera gráficos de barras, circulares y de tendencias con
                datos filtrados y exportables.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">🎯 Establecimiento de Metas</h4>
              <p className="text-sm text-muted-foreground">
                Define objetivos de campaña, analiza escenarios y
                planifica estrategias basadas en datos históricos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

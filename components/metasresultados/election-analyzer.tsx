"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, BarChart3, PieChart, TrendingUp, FileText, Target, Users, Flag } from 'lucide-react'

import { CsvUploader } from "./csv-uploader"
import { DataExplorer } from "./data-explorer"
import { ResultsSummary } from "./results-summary"
import { ElectoralResultsChart } from "./electoral-results-chart"
import { StatisticalAnalysis } from "./statistical-analysis"
import { GoalsAnalyzer } from "./goals-analyzer"
import { ElectoralFilters } from "./electoral-filters"
import { EmptyState } from "./empty-state"

// Partidos mexicanos específicos (excluyendo DISTRITO_F y DISTRITO_L)
const MEXICAN_PARTIES = [
  'PAN', 'PVEM_PT', 'PRI', 'PVEM', 'NO_REGISTRADAS', 'NULOS', 'PT', 'MC', 'PRD',
  'PAN-PRI-PRD', 'PAN-PRI', 'PAN-PRD', 'PRI-PRD', 'PVEM_PT_MORENA', 'PVEM_MORENA',
  'PT_MORENA', 'MORENA'
]

export function ElectionAnalyzer() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("upload")

  // Estados de filtros
  const [selectedMunicipio, setSelectedMunicipio] = useState("todos")
  const [selectedDistrito, setSelectedDistrito] = useState("todos")
  const [selectedSeccion, setSelectedSeccion] = useState("todos")
  const [selectedParty, setSelectedParty] = useState("")

  // Datos filtrados
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return []

    let filtered = [...data]

    if (selectedMunicipio !== "todos") {
      filtered = filtered.filter(row =>
        (row.MUNICIPIO || row.municipio) === selectedMunicipio
      )
    }

    if (selectedDistrito !== "todos") {
      filtered = filtered.filter(row =>
        (row.DISTRITO || row.distrito) === selectedDistrito
      )
    }

    if (selectedSeccion !== "todos") {
      filtered = filtered.filter(row =>
        (row.SECCION || row.seccion)?.toString() === selectedSeccion
      )
    }

    return filtered
  }, [data, selectedMunicipio, selectedDistrito, selectedSeccion])

  // Estadísticas generales
  const stats = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        totalRecords: 0,
        totalMunicipios: 0,
        totalDistritos: 0,
        totalSecciones: 0,
        hasValidData: false
      }
    }

    const totalRecords = data.length
    const totalMunicipios = new Set(data.map(row => row.MUNICIPIO || row.municipio).filter(Boolean)).size
    const totalDistritos = new Set(data.map(row => row.DISTRITO || row.distrito).filter(Boolean)).size
    const totalSecciones = new Set(data.map(row => row.SECCION || row.seccion).filter(Boolean)).size

    // Verificar si hay al menos un partido con datos
    const hasValidData = MEXICAN_PARTIES.some(party =>
      data.some(row => Number(row[party]) > 0)
    )

    return {
      totalRecords,
      totalMunicipios,
      totalDistritos,
      totalSecciones,
      hasValidData
    }
  }, [data])

  const handleDataLoad = (newData: any[]) => {
    setData(newData)
    setError(null)

    // Resetear filtros
    setSelectedMunicipio("todos")
    setSelectedDistrito("todos")
    setSelectedSeccion("todos")
    setSelectedParty("")

    // Cambiar a la pestaña de resumen si hay datos válidos
    if (newData && newData.length > 0) {
      setActiveTab("summary")
    }
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
    setData([])
  }

  const clearData = () => {
    setData([])
    setError(null)
    setSelectedMunicipio("todos")
    setSelectedDistrito("todos")
    setSelectedSeccion("todos")
    setSelectedParty("")
    setActiveTab("upload")
  }

  const handlePartyChange = (party: string) => {
    setSelectedParty(party)
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-6 w-6" />
            Analizador Electoral - Sistema Mexicano
          </CardTitle>
          {stats.hasValidData && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Badge variant="outline">{stats.totalRecords.toLocaleString()} registros</Badge>
              <Badge variant="outline">{stats.totalMunicipios} municipios</Badge>
              <Badge variant="outline">{stats.totalDistritos} distritos</Badge>
              <Badge variant="outline">{stats.totalSecciones} secciones</Badge>
              {data.length !== filteredData.length && (
                <Badge variant="secondary">
                  {filteredData.length.toLocaleString()} filtrados
                </Badge>
              )}
            </div>
          )}
        </CardHeader>
        {stats.hasValidData && (
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Sistema configurado para partidos mexicanos: PAN, PRI, PRD, MORENA, MC, PT, PVEM y coaliciones
              </p>
              <Button variant="outline" size="sm" onClick={clearData}>
                Cargar nuevos datos
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Mostrar error si existe */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filtros geográficos (solo si hay datos) */}
      {stats.hasValidData && (
        <ElectoralFilters
          data={data}
          selectedMunicipio={selectedMunicipio}
          selectedDistrito={selectedDistrito}
          selectedSeccion={selectedSeccion}
          onMunicipioChange={setSelectedMunicipio}
          onDistritoChange={setSelectedDistrito}
          onSeccionChange={setSelectedSeccion}
          totalRecords={filteredData.length}
          originalRecords={data.length}
        />
      )}

      {/* Contenido principal */}
      {!stats.hasValidData ? (
        <EmptyState onFileSelect={() => setActiveTab("upload")} />
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Datos
            </TabsTrigger>
            <TabsTrigger value="summary" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Resumen
            </TabsTrigger>
            <TabsTrigger value="charts" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Gráficos
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Análisis
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Metas
            </TabsTrigger>
            <TabsTrigger value="explorer" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Explorar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <CsvUploader
              onDataLoad={handleDataLoad}
              onError={handleError}
              onLoadingChange={setLoading}
              expectedColumns={MEXICAN_PARTIES.concat(['SECCION', 'MUNICIPIO', 'DISTRITO', 'LISTA_NOMINAL'])}
            />
          </TabsContent>

          <TabsContent value="summary" className="space-y-6">
            <ResultsSummary
              data={filteredData}
              selectedMunicipio={selectedMunicipio}
              selectedDistrito={selectedDistrito}
              selectedSeccion={selectedSeccion}
            />
          </TabsContent>

          <TabsContent value="charts" className="space-y-6">
            <ElectoralResultsChart data={filteredData} />
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <StatisticalAnalysis
              data={filteredData}
              selectedParty={selectedParty}
              onPartyChange={handlePartyChange}
              selectedMunicipio={selectedMunicipio}
              selectedDistrito={selectedDistrito}
              selectedSeccion={selectedSeccion}
            />
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <GoalsAnalyzer
              data={filteredData}
              parties={MEXICAN_PARTIES}
              selectedMunicipio={selectedMunicipio}
              selectedDistrito={selectedDistrito}
              selectedSeccion={selectedSeccion}
            />
          </TabsContent>

          <TabsContent value="explorer" className="space-y-6">
            <DataExplorer
              data={filteredData}
            />
          </TabsContent>
        </Tabs>
      )}

      {/* Indicador de carga */}
      {loading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Loader2 className="h-6 w-6 animate-spin" />
              <div>
                <p className="font-medium">Procesando datos electorales...</p>
                <p className="text-sm text-muted-foreground">
                  Analizando partidos y coaliciones mexicanos
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

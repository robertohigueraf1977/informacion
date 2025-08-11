"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Download, Filter, SortAsc, SortDesc, Database, BarChart3, FileText, Eye } from 'lucide-react'

interface DataExplorerProps {
  data: any[]
}

// Partidos y coaliciones mexicanos específicos
const MEXICAN_PARTIES = [
  'PAN', 'PVEM_PT', 'PRI', 'PVEM', 'NO_REGISTRADAS', 'NULOS', 'PT', 'MC', 'PRD',
  'PAN-PRI-PRD', 'PAN-PRI', 'PAN-PRD', 'PRI-PRD', 'PVEM_PT_MORENA', 'PVEM_MORENA',
  'PT_MORENA', 'MORENA'
]

const ADMINISTRATIVE_COLUMNS = [
  'SECCION', 'CASILLA', 'DISTRITO', 'MUNICIPIO', 'LISTA_NOMINAL', 'TOTAL_VOTOS'
]

export function DataExplorer({ data }: DataExplorerProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortColumn, setSortColumn] = useState("")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [filterColumn, setFilterColumn] = useState("")
  const [filterValue, setFilterValue] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  // Análisis de columnas específico para datos electorales mexicanos
  const columnAnalysis = useMemo(() => {
    if (!data || data.length === 0) return []

    const firstRow = data[0]
    return Object.keys(firstRow).map(column => {
      const values = data.map(row => row[column]).filter(val => val !== null && val !== undefined && val !== "")
      const uniqueValues = new Set(values)
      const isNumeric = values.every(val => !isNaN(Number(val)) && val !== "")

      // Determinar el tipo de columna
      let columnType = 'unknown'
      if (ADMINISTRATIVE_COLUMNS.includes(column.toUpperCase())) {
        columnType = 'administrative'
      } else if (MEXICAN_PARTIES.includes(column.toUpperCase())) {
        columnType = 'party'
      } else if (column.toUpperCase() === 'LISTA_NOMINAL') {
        columnType = 'electoral_list'
      } else if (isNumeric) {
        columnType = 'numeric'
      } else {
        columnType = 'text'
      }

      let stats: any = {
        column,
        type: columnType,
        isNumeric,
        totalValues: values.length,
        uniqueValues: uniqueValues.size,
        nullValues: data.length - values.length,
        completeness: (values.length / data.length) * 100
      }

      if (isNumeric && values.length > 0) {
        const numericValues = values.map(val => Number(val))
        stats.min = Math.min(...numericValues)
        stats.max = Math.max(...numericValues)
        stats.avg = numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length
        stats.sum = numericValues.reduce((sum, val) => sum + val, 0)

        // Para partidos, calcular porcentaje del total
        if (columnType === 'party') {
          const totalVotes = data.reduce((sum, row) => {
            return sum + MEXICAN_PARTIES.reduce((partySum, party) => {
              return partySum + (Number(row[party]) || 0)
            }, 0)
          }, 0)
          stats.percentageOfTotal = totalVotes > 0 ? (stats.sum / totalVotes) * 100 : 0
        }
      } else {
        stats.topValues = Array.from(uniqueValues)
          .map(val => ({
            value: val,
            count: values.filter(v => v === val).length
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
      }

      return stats
    })
  }, [data])

  // Filtrar y ordenar datos
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return []

    let filtered = [...data]

    // Aplicar búsqueda
    if (searchTerm) {
      filtered = filtered.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    // Aplicar filtro por columna
    if (filterColumn && filterColumn !== "none" && filterValue) {
      filtered = filtered.filter(row =>
        String(row[filterColumn]).toLowerCase().includes(filterValue.toLowerCase())
      )
    }

    // Aplicar ordenamiento
    if (sortColumn) {
      filtered.sort((a, b) => {
        const aVal = a[sortColumn]
        const bVal = b[sortColumn]

        // Manejar valores numéricos
        if (!isNaN(Number(aVal)) && !isNaN(Number(bVal))) {
          const comparison = Number(aVal) - Number(bVal)
          return sortDirection === "asc" ? comparison : -comparison
        }

        // Manejar valores de texto
        const comparison = String(aVal).localeCompare(String(bVal))
        return sortDirection === "asc" ? comparison : -comparison
      })
    }

    return filtered
  }, [data, searchTerm, filterColumn, filterValue, sortColumn, sortDirection])

  // Paginación
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return processedData.slice(startIndex, startIndex + pageSize)
  }, [processedData, currentPage, pageSize])

  const totalPages = Math.ceil(processedData.length / pageSize)

  // Exportar datos
  const exportToCSV = () => {
    if (processedData.length === 0) return

    const headers = Object.keys(processedData[0])
    const csvContent = [
      headers.join(","),
      ...processedData.map(row =>
        headers.map(header => `"${row[header] || ""}"`).join(",")
      )
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `datos_electorales_mexico_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("desc")
    }
    setCurrentPage(1)
  }

  // Análisis específico de datos electorales mexicanos
  const electoralSummary = useMemo(() => {
    if (!data || data.length === 0) return null

    const partyColumns = columnAnalysis.filter(col => col.type === 'party')
    const totalVotes = partyColumns.reduce((sum, party) => sum + (party.sum || 0), 0)
    const totalListaNominal = data.reduce((sum, row) => sum + (Number(row.LISTA_NOMINAL) || 0), 0)
    const participation = totalListaNominal > 0 ? (totalVotes / totalListaNominal) * 100 : 0

    const partyResults = partyColumns.map(party => ({
      name: party.column,
      votes: party.sum || 0,
      percentage: totalVotes > 0 ? ((party.sum || 0) / totalVotes) * 100 : 0
    })).sort((a, b) => b.votes - a.votes)

    return {
      totalVotes,
      totalListaNominal,
      participation,
      partyResults,
      sections: data.length,
      municipalities: new Set(data.map(row => row.MUNICIPIO).filter(Boolean)).size,
      districts: new Set(data.map(row => row.DISTRITO).filter(Boolean)).size
    }
  }, [data, columnAnalysis])

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Explorador de Datos Electorales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay datos electorales disponibles para explorar</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Explorador de Datos Electorales Mexicanos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="data" className="space-y-4">
            <TabsList>
              <TabsTrigger value="data" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Vista de Datos
              </TabsTrigger>
              <TabsTrigger value="analysis" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Análisis de Partidos
              </TabsTrigger>
              <TabsTrigger value="summary" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Resumen Electoral
              </TabsTrigger>
            </TabsList>

            <TabsContent value="data" className="space-y-4">
              {/* Controles de filtrado y búsqueda */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar en todos los campos..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="pl-10"
                  />
                </div>

                <Select value={filterColumn} onValueChange={setFilterColumn}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por columna" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin filtro</SelectItem>
                    {Object.keys(data[0] || {}).map(column => (
                      <SelectItem key={column} value={column}>
                        {column}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {filterColumn && filterColumn !== "none" && (
                  <Input
                    placeholder={`Filtrar ${filterColumn}...`}
                    value={filterValue}
                    onChange={(e) => {
                      setFilterValue(e.target.value)
                      setCurrentPage(1)
                    }}
                  />
                )}

                <Select value={pageSize.toString()} onValueChange={(value) => {
                  setPageSize(Number(value))
                  setCurrentPage(1)
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 por página</SelectItem>
                    <SelectItem value="25">25 por página</SelectItem>
                    <SelectItem value="50">50 por página</SelectItem>
                    <SelectItem value="100">100 por página</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Información y controles */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Badge variant="outline">
                    {processedData.length.toLocaleString()} de {data.length.toLocaleString()} registros
                  </Badge>
                  {(searchTerm || (filterColumn && filterColumn !== "none")) && (
                    <Badge variant="secondary">Filtros activos</Badge>
                  )}
                </div>
                <Button onClick={exportToCSV} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>

              {/* Tabla de datos */}
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-[600px]">
                  <table className="w-full border-collapse">
                    <thead className="sticky top-0 bg-muted/50 z-10">
                      <tr>
                        {Object.keys(data[0] || {}).map(column => (
                          <th
                            key={column}
                            className="p-3 text-left text-xs font-medium text-muted-foreground border-b cursor-pointer hover:bg-muted/70"
                            onClick={() => handleSort(column)}
                          >
                            <div className="flex items-center gap-2">
                              <span>{column}</span>
                              {MEXICAN_PARTIES.includes(column.toUpperCase()) && (
                                <Badge variant="outline" className="text-xs">Partido</Badge>
                              )}
                              {column.toUpperCase() === 'LISTA_NOMINAL' && (
                                <Badge variant="secondary" className="text-xs">Lista</Badge>
                              )}
                              {sortColumn === column && (
                                sortDirection === "asc" ?
                                  <SortAsc className="h-3 w-3" /> :
                                  <SortDesc className="h-3 w-3" />
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.map((row, index) => (
                        <tr key={index} className="border-b hover:bg-muted/30 transition-colors">
                          {Object.entries(row).map(([column, value], cellIndex) => (
                            <td key={cellIndex} className="p-3 text-sm border-r">
                              {typeof value === 'number' ? value.toLocaleString() : String(value || '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              <div className="grid gap-4">
                {columnAnalysis.filter(col => col.type === 'party').map(party => (
                  <Card key={party.column}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center justify-between">
                        <span>{party.column}</span>
                        <div className="flex gap-2">
                          <Badge variant="default">Partido</Badge>
                          {party.percentageOfTotal && (
                            <Badge variant="outline">
                              {party.percentageOfTotal.toFixed(1)}% del total
                            </Badge>
                          )}
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center p-3 bg-blue-50 rounded">
                          <div className="font-bold text-lg">{(party.sum || 0).toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">Total de votos</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded">
                          <div className="font-bold text-lg">{(party.avg || 0).toFixed(0).toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">Promedio por sección</div>
                        </div>
                        <div className="text-center p-3 bg-yellow-50 rounded">
                          <div className="font-bold text-lg">{party.max?.toLocaleString() || 0}</div>
                          <div className="text-sm text-muted-foreground">Máximo en sección</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded">
                          <div className="font-bold text-lg">{party.completeness.toFixed(1)}%</div>
                          <div className="text-sm text-muted-foreground">Completitud</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="summary" className="space-y-4">
              {electoralSummary && (
                <div className="space-y-6">
                  {/* Estadísticas generales */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {electoralSummary.totalVotes.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">Total de Votos</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {electoralSummary.totalListaNominal.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">Lista Nominal</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {electoralSummary.participation.toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Participación</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {electoralSummary.sections.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">Secciones</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Resultados por partido */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Resultados por Partido Político</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {electoralSummary.partyResults.map((party, index) => (
                          <div key={party.name} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Badge variant={index < 3 ? "default" : "secondary"}>
                                #{index + 1}
                              </Badge>
                              <span className="font-medium">{party.name}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">{party.votes.toLocaleString()}</div>
                              <div className="text-sm text-muted-foreground">
                                {party.percentage.toFixed(2)}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Cobertura geográfica */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Cobertura Geográfica</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-muted/30 rounded">
                          <div className="text-2xl font-bold">{electoralSummary.sections}</div>
                          <div className="text-sm text-muted-foreground">Secciones Electorales</div>
                        </div>
                        <div className="text-center p-4 bg-muted/30 rounded">
                          <div className="text-2xl font-bold">{electoralSummary.municipalities}</div>
                          <div className="text-sm text-muted-foreground">Municipios</div>
                        </div>
                        <div className="text-center p-4 bg-muted/30 rounded">
                          <div className="text-2xl font-bold">{electoralSummary.districts}</div>
                          <div className="text-sm text-muted-foreground">Distritos</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

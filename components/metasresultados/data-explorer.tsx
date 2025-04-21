"use client"

import { useState, useMemo } from "react"
import { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, SortAsc, SortDesc, Search, Info, ChevronLeft, ChevronRight } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CardSpotlight } from "@/components/ui/card-spotlight"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { StatCard } from "@/components/ui/stat-card"
import { motion } from "framer-motion"

interface DataExplorerProps {
  data: any[]
}

export function DataExplorer({ data }: DataExplorerProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<string>("SECCION")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [selectedParty, setSelectedParty] = useState<string | null>(null)

  // Obtener todas las columnas disponibles
  const columns = useMemo(() => {
    if (!data || data.length === 0) return []
    return Object.keys(data[0])
  }, [data])

  // Filtrar y ordenar los datos
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return []

    let filtered = [...data]

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter((row) => {
        return Object.values(row).some((value) => {
          if (value === null || value === undefined) return false
          return String(value).toLowerCase().includes(searchTerm.toLowerCase())
        })
      })
    }

    // Ordenar los datos
    if (sortField) {
      filtered.sort((a, b) => {
        const aValue = a[sortField]
        const bValue = b[sortField]

        // Manejar valores numéricos
        if (!isNaN(Number(aValue)) && !isNaN(Number(bValue))) {
          return sortDirection === "asc" ? Number(aValue) - Number(bValue) : Number(bValue) - Number(aValue)
        }

        // Manejar valores de texto
        const aString = String(aValue || "").toLowerCase()
        const bString = String(bValue || "").toLowerCase()

        return sortDirection === "asc" ? aString.localeCompare(bString) : bString.localeCompare(aString)
      })
    }

    return filtered
  }, [data, searchTerm, sortField, sortDirection])

  // Paginación
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage
    return filteredData.slice(startIndex, startIndex + rowsPerPage)
  }, [filteredData, currentPage, rowsPerPage])

  // Calcular estadísticas para la columna seleccionada
  const columnStats = useMemo(() => {
    if (!selectedParty || !data || data.length === 0) return null

    const values = data.map((row) => Number(row[selectedParty])).filter((val) => !isNaN(val))

    if (values.length === 0) return null

    const sum = values.reduce((acc, val) => acc + val, 0)
    const avg = sum / values.length
    const max = Math.max(...values)
    const min = Math.min(...values)

    // Encontrar la sección con el valor máximo
    const maxSection = data.find((row) => Number(row[selectedParty]) === max)?.SECCION
    // Encontrar la sección con el valor mínimo
    const minSection = data.find((row) => Number(row[selectedParty]) === min)?.SECCION

    // Calcular la mediana
    const sortedValues = [...values].sort((a, b) => a - b)
    const midIndex = Math.floor(sortedValues.length / 2)
    const median =
      sortedValues.length % 2 === 0 ? (sortedValues[midIndex - 1] + sortedValues[midIndex]) / 2 : sortedValues[midIndex]

    return {
      count: values.length,
      sum,
      avg,
      median,
      max,
      min,
      maxSection,
      minSection,
    }
  }, [selectedParty, data])

  // Exportar datos a CSV
  const exportToCSV = () => {
    if (!data || data.length === 0) return

    const headers = columns.join(",")
    const csvData = [
      headers,
      ...filteredData.map((row) => {
        return columns
          .map((col) => {
            const value = row[col]
            // Manejar valores que contienen comas
            if (typeof value === "string" && value.includes(",")) {
              return `"${value}"`
            }
            return value
          })
          .join(",")
      }),
    ].join("\n")

    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `datos_electorales_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Cambiar la dirección de ordenamiento
  const toggleSortDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc")
  }

  // Calcular el número total de páginas
  const totalPages = Math.ceil(filteredData.length / rowsPerPage)

  // Obtener partidos políticos (excluyendo columnas no relacionadas)
  const parties = useMemo(() => {
    return columns.filter(
      (col) =>
        col !== "SECCION" &&
        col !== "DISTRITO" &&
        col !== "MUNICIPIO" &&
        col !== "LOCALIDAD" &&
        col !== "LISTA_NOMINAL",
    )
  }, [columns])

  return (
    <div className="space-y-6 animate-in fade-in-50">
      <Tabs defaultValue="table" className="space-y-4">
        <TabsList className="bg-background border w-full p-1 rounded-lg">
          <TabsTrigger
            value="table"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md py-2 flex-1"
          >
            Tabla de Datos
          </TabsTrigger>
          <TabsTrigger
            value="stats"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md py-2 flex-1"
          >
            Estadísticas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="table">
          <CardSpotlight>
            <CardHeader className="flex flex-row items-center justify-between bg-secondary-soft rounded-t-lg">
              <div>
                <CardTitle className="text-primary">Explorador de Datos</CardTitle>
                <CardDescription>
                  {filteredData.length} registros encontrados de {data.length} totales
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-2 top-2.5 text-muted-foreground" />
                  <Input
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-[200px] border-accent-soft"
                  />
                </div>
                <Button variant="outline" onClick={exportToCSV} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Exportar CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Select value={sortField} onValueChange={setSortField}>
                  <SelectTrigger className="w-[180px] border-accent-soft">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map((column) => (
                      <SelectItem key={column} value={column}>
                        {column}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={toggleSortDirection} className="border-accent-soft">
                  {sortDirection === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </Button>

                <Badge className="ml-auto">
                  {filteredData.length} de {data.length} registros
                </Badge>
              </div>

              <div className="rounded-md border border-accent-soft overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-secondary/50 sticky top-0">
                      <TableRow>
                        {columns.map((column) => (
                          <TableHead
                            key={column}
                            className={`${column === sortField ? "bg-secondary" : ""} cursor-pointer hover:bg-secondary transition-colors`}
                            onClick={() => {
                              if (column === sortField) {
                                toggleSortDirection()
                              } else {
                                setSortField(column)
                                setSortDirection("asc")
                              }
                            }}
                          >
                            <div className="flex items-center">
                              {column}
                              {column === sortField && (
                                <span className="ml-1">
                                  {sortDirection === "asc" ? (
                                    <SortAsc className="h-3 w-3" />
                                  ) : (
                                    <SortDesc className="h-3 w-3" />
                                  )}
                                </span>
                              )}
                            </div>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={columns.length} className="text-center py-8">
                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                              <Info className="h-8 w-8 mb-2" />
                              <p>No se encontraron resultados para tu búsqueda</p>
                              {searchTerm && (
                                <Button variant="link" onClick={() => setSearchTerm("")} className="mt-2">
                                  Borrar filtro
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedData.map((row, rowIndex) => (
                          <TableRow key={`row-${rowIndex}`} className="hover:bg-secondary/20 transition-colors">
                            {columns.map((column) => (
                              <TableCell key={`cell-${rowIndex}-${column}`} className="py-2">
                                {row[column] !== undefined && row[column] !== null ? row[column] : "-"}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground whitespace-nowrap">
                    Mostrando {filteredData.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} a{" "}
                    {Math.min(currentPage * rowsPerPage, filteredData.length)} de {filteredData.length} registros
                  </p>
                  <Select
                    value={rowsPerPage.toString()}
                    onValueChange={(value) => {
                      setRowsPerPage(Number(value))
                      setCurrentPage(1)
                    }}
                  >
                    <SelectTrigger className="w-[80px] border-accent-soft">
                      <SelectValue placeholder="10" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-1 ml-auto">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <ChevronLeft className="h-4 w-4 -ml-2" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="h-8 w-8"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm px-2">
                    Página {currentPage} de {totalPages || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="h-8 w-8"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="h-8 w-8"
                  >
                    <ChevronRight className="h-4 w-4" />
                    <ChevronRight className="h-4 w-4 -ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </CardSpotlight>
        </TabsContent>

        <TabsContent value="stats">
          <CardSpotlight>
            <CardHeader className="bg-secondary-soft rounded-t-lg">
              <CardTitle className="text-primary">Estadísticas por Partido/Coalición</CardTitle>
              <CardDescription>Selecciona un partido para ver sus estadísticas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-6">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <Select value={selectedParty || ""} onValueChange={setSelectedParty}>
                          <SelectTrigger className="w-[250px] border-accent-soft">
                            <SelectValue placeholder="Seleccionar partido/coalición" />
                          </SelectTrigger>
                          <SelectContent>
                            {parties.map((party) => (
                              <SelectItem key={party} value={party}>
                                {party}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Selecciona un partido o coalición para ver sus estadísticas detalladas</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {selectedParty && columnStats ? (
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardSpotlight containerClassName="h-full">
                    <StatCard
                      title="Total de Votos"
                      value={columnStats.sum.toLocaleString()}
                      description={`Para ${selectedParty}`}
                      className="border-0 h-full"
                    />
                  </CardSpotlight>

                  <CardSpotlight containerClassName="h-full">
                    <StatCard
                      title="Promedio por Sección"
                      value={columnStats.avg.toFixed(2)}
                      description="Votos promedio por sección"
                      className="border-0 h-full"
                    />
                  </CardSpotlight>

                  <CardSpotlight containerClassName="h-full">
                    <StatCard
                      title="Mediana"
                      value={columnStats.median.toFixed(2)}
                      description="Valor central de la distribución"
                      className="border-0 h-full"
                    />
                  </CardSpotlight>

                  <CardSpotlight containerClassName="h-full">
                    <StatCard
                      title="Secciones con Datos"
                      value={columnStats.count.toLocaleString()}
                      description={`De ${data.length} secciones totales`}
                      className="border-0 h-full"
                    />
                  </CardSpotlight>

                  <CardSpotlight containerClassName="h-full">
                    <StatCard
                      title="Valor Máximo"
                      value={columnStats.max.toLocaleString()}
                      description={`Sección: ${columnStats.maxSection}`}
                      className="border-0 h-full"
                    />
                  </CardSpotlight>

                  <CardSpotlight containerClassName="h-full">
                    <StatCard
                      title="Valor Mínimo"
                      value={columnStats.min.toLocaleString()}
                      description={`Sección: ${columnStats.minSection}`}
                      className="border-0 h-full"
                    />
                  </CardSpotlight>
                </motion.div>
              ) : (
                <div className="text-center py-16 text-muted-foreground">
                  <Info className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p className="text-lg">Selecciona un partido o coalición para ver sus estadísticas</p>
                  <p className="text-sm mt-2 max-w-md mx-auto">
                    Las estadísticas te permitirán entender mejor la distribución de votos por sección
                  </p>
                </div>
              )}
            </CardContent>
          </CardSpotlight>
        </TabsContent>
      </Tabs>
    </div>
  )
}

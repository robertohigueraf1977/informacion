"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Target,
  TrendingUp,
  Download,
  Filter,
  BarChart3,
  MapPin,
  Users,
  CheckCircle2,
  AlertTriangle,
  X,
  Plus,
} from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

interface GoalsAnalyzerProps {
  data: any[]
  partidos?: string[]
  coaliciones?: Array<{
    nombre: string
    partidos: string[]
    color: string
  }>
  selectedCoalition?: string | null
}

interface SectionData {
  seccion: string
  distrito: string
  municipio: string
  municipioNombre: string
  totalVotosEmitidos: number
  votosPartidoCoalicion: number
  porcentajeActual: number
  porcentajeMeta: number
  votosQueRepresentaMeta: number
  status: "Alcanzada" | "Cerca" | "Lejana"
  prioridad: "Alta" | "Media" | "Baja"
}

// Mapeo de códigos de municipio a nombres
const MUNICIPIOS_MAP: Record<string, string> = {
  "1": "Comondú",
  "2": "Mulegé",
  "3": "La Paz",
  "4": "Los Cabos",
  "5": "Loreto",
}

// Todos los partidos disponibles
const PARTIDOS_DISPONIBLES = [
  "PAN",
  "PRI",
  "PRD",
  "PVEM",
  "PT",
  "MC",
  "MORENA",
  "PAN-PRI-PRD",
  "PAN-PRI",
  "PAN-PRD",
  "PRI-PRD",
  "PVEM_PT_MORENA",
  "PVEM_MORENA",
  "PT_MORENA",
  "PVEM_PT",
]

// Componente StatCard simplificado
function SimpleStatCard({
  title,
  value,
  description,
  icon,
  trend,
}: {
  title: string
  value: string | number
  description: string
  icon: React.ReactNode
  trend?: { value: number; isPositive: boolean; suffix?: string } | null
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <div className={`text-xs ${trend.isPositive ? "text-green-600" : "text-red-600"}`}>
            {trend.value > 0 ? "+" : ""}
            {trend.value.toFixed(1)}
            {trend.suffix || ""}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function GoalsAnalyzer({ data, coaliciones = [] }: GoalsAnalyzerProps) {
  // Estados principales
  const [goalPercentage, setGoalPercentage] = useState(50)
  const [selectedPartidos, setSelectedPartidos] = useState<string[]>(["MORENA"])
  const [showPartidoSelector, setShowPartidoSelector] = useState(false)

  // Estados de filtros
  const [filtroDistrito, setFiltroDistrito] = useState("todos")
  const [filtroMunicipio, setFiltroMunicipio] = useState("todos")
  const [filtroSeccion, setFiltroSeccion] = useState("")
  const [filtroStatus, setFiltroStatus] = useState("todos")

  // Función para agregar/quitar partidos de la selección
  const togglePartido = (partido: string) => {
    setSelectedPartidos((prev) => {
      if (prev.includes(partido)) {
        return prev.filter((p) => p !== partido)
      } else {
        return [...prev, partido]
      }
    })
  }

  // Función para agregar coalición completa
  const addCoalicion = (coalicion: { nombre: string; partidos: string[] }) => {
    setSelectedPartidos((prev) => {
      const newPartidos = [...prev]
      coalicion.partidos.forEach((partido) => {
        if (!newPartidos.includes(partido)) {
          newPartidos.push(partido)
        }
      })
      return newPartidos
    })
  }

  // Función para quitar partido específico
  const removePartido = (partido: string) => {
    setSelectedPartidos((prev) => prev.filter((p) => p !== partido))
  }

  // Procesar datos con selección múltiple
  const processedData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return []

    return data
      .map((row) => {
        const convertToNumber = (value: any): number => {
          if (typeof value === "number" && !isNaN(value)) return value
          if (typeof value === "string") {
            const parsed = Number.parseFloat(value.replace(/,/g, ""))
            return isNaN(parsed) ? 0 : parsed
          }
          return 0
        }

        const seccion = String(row.SECCION || "").trim()
        const distrito = String(row.DISTRITO_L || row.DISTRITO_F || row.DISTRITO || "").trim()
        const municipio = String(row.MUNICIPIO || "").trim()
        const municipioNombre = MUNICIPIOS_MAP[municipio] || municipio

        // Calcular total de votos emitidos en la sección
        let totalVotosEmitidos = 0
        PARTIDOS_DISPONIBLES.forEach((campo) => {
          totalVotosEmitidos += convertToNumber(row[campo])
        })
        totalVotosEmitidos += convertToNumber(row.NULOS) + convertToNumber(row.NO_REGISTRADAS)

        // Calcular votos de los partidos/coaliciones seleccionados (SUMA)
        let votosPartidoCoalicion = 0
        selectedPartidos.forEach((partido) => {
          votosPartidoCoalicion += convertToNumber(row[partido])
        })

        // Calcular porcentaje actual que representa la votación
        const porcentajeActual = totalVotosEmitidos > 0 ? (votosPartidoCoalicion / totalVotosEmitidos) * 100 : 0

        // Porcentaje meta seleccionado
        const porcentajeMeta = goalPercentage

        // Número de votos que representa el porcentaje meta
        const votosQueRepresentaMeta = Math.ceil((porcentajeMeta / 100) * totalVotosEmitidos)

        // Determinar status basado en si ya se alcanzó la meta
        let status: "Alcanzada" | "Cerca" | "Lejana" = "Lejana"
        if (porcentajeActual >= porcentajeMeta) {
          status = "Alcanzada"
        } else if (porcentajeActual >= porcentajeMeta * 0.9) {
          status = "Cerca"
        }

        // Determinar prioridad
        let prioridad: "Alta" | "Media" | "Baja" = "Baja"
        if (status === "Cerca") {
          prioridad = "Alta"
        } else if (porcentajeActual >= porcentajeMeta * 0.7) {
          prioridad = "Media"
        }

        return {
          seccion,
          distrito,
          municipio,
          municipioNombre,
          totalVotosEmitidos,
          votosPartidoCoalicion,
          porcentajeActual,
          porcentajeMeta,
          votosQueRepresentaMeta,
          status,
          prioridad,
        }
      })
      .filter((row) => row.seccion && row.totalVotosEmitidos > 0)
  }, [data, selectedPartidos, goalPercentage])

  // Obtener opciones de filtros ordenadas
  const opcionesFiltros = useMemo(() => {
    const distritosSet = new Set<string>()
    const municipiosSet = new Set<string>()

    processedData.forEach((d) => {
      if (d.distrito) {
        distritosSet.add(d.distrito)
      }
      if (d.municipio) {
        municipiosSet.add(d.municipio)
      }
    })

    const distritos = Array.from(distritosSet).sort((a, b) => {
      const numA = Number.parseInt(a) || 0
      const numB = Number.parseInt(b) || 0
      return numA - numB
    })

    const municipios = Array.from(municipiosSet).sort((a, b) => {
      const numA = Number.parseInt(a) || 0
      const numB = Number.parseInt(b) || 0
      return numA - numB
    })

    return { distritos, municipios }
  }, [processedData])

  // Aplicar filtros
  const filteredData = useMemo(() => {
    return processedData.filter((row) => {
      const distritoFilter = filtroDistrito === "todos" || row.distrito === filtroDistrito
      const municipioFilter = filtroMunicipio === "todos" || row.municipio === filtroMunicipio
      const seccionFilter = !filtroSeccion || row.seccion.toLowerCase().includes(filtroSeccion.toLowerCase())
      const statusFilter = filtroStatus === "todos" || row.status === filtroStatus

      return distritoFilter && municipioFilter && seccionFilter && statusFilter
    })
  }, [processedData, filtroDistrito, filtroMunicipio, filtroSeccion, filtroStatus])

  // Estadísticas
  const stats = useMemo(() => {
    const total = filteredData.length
    const alcanzadas = filteredData.filter((d) => d.status === "Alcanzada").length
    const cerca = filteredData.filter((d) => d.status === "Cerca").length
    const totalVotosEmitidos = filteredData.reduce((sum, d) => sum + (d.totalVotosEmitidos || 0), 0)
    const totalVotosPartido = filteredData.reduce((sum, d) => sum + (d.votosPartidoCoalicion || 0), 0)
    const totalVotosMeta = filteredData.reduce((sum, d) => sum + (d.votosQueRepresentaMeta || 0), 0)

    const porcentajeExito = total > 0 ? (alcanzadas / total) * 100 : 0
    const porcentajePromedioActual = totalVotosEmitidos > 0 ? (totalVotosPartido / totalVotosEmitidos) * 100 : 0
    const votosAdicionales = Math.max(0, totalVotosMeta - totalVotosPartido)

    return {
      total: isNaN(total) ? 0 : total,
      alcanzadas: isNaN(alcanzadas) ? 0 : alcanzadas,
      cerca: isNaN(cerca) ? 0 : cerca,
      porcentajeExito: isNaN(porcentajeExito) ? 0 : porcentajeExito,
      totalVotosEmitidos: isNaN(totalVotosEmitidos) ? 0 : totalVotosEmitidos,
      totalVotosPartido: isNaN(totalVotosPartido) ? 0 : totalVotosPartido,
      totalVotosMeta: isNaN(totalVotosMeta) ? 0 : totalVotosMeta,
      porcentajePromedioActual: isNaN(porcentajePromedioActual) ? 0 : porcentajePromedioActual,
      votosAdicionales: isNaN(votosAdicionales) ? 0 : votosAdicionales,
    }
  }, [filteredData])

  // Definir columnas de la tabla
  const columns: ColumnDef<SectionData>[] = [
    {
      accessorKey: "seccion",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Sección" />,
      cell: ({ row }) => <div className="font-medium">{row.getValue("seccion")}</div>,
    },
    {
      accessorKey: "distrito",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Distrito" />,
      cell: ({ row }) => <div className="text-center">{row.getValue("distrito")}</div>,
    },
    {
      accessorKey: "municipioNombre",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Municipio" />,
    },
    {
      accessorKey: "totalVotosEmitidos",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Total Votos Emitidos" />,
      cell: ({ row }) => (
        <div className="text-right font-mono">{row.getValue<number>("totalVotosEmitidos").toLocaleString()}</div>
      ),
    },
    {
      accessorKey: "votosPartidoCoalicion",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Votos Seleccionados" className="text-center" />
      ),
      cell: ({ row }) => (
        <div className="text-right font-mono font-medium text-blue-600">
          {row.getValue<number>("votosPartidoCoalicion").toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "porcentajeActual",
      header: ({ column }) => <DataTableColumnHeader column={column} title="% Actual" />,
      cell: ({ row }) => {
        const value = row.getValue<number>("porcentajeActual")
        const meta = row.original.porcentajeMeta
        return (
          <div className="text-right">
            <span className={`font-medium ${value >= meta ? "text-green-600" : "text-orange-600"}`}>
              {value.toFixed(2)}%
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "porcentajeMeta",
      header: ({ column }) => <DataTableColumnHeader column={column} title="% Meta" />,
      cell: ({ row }) => (
        <div className="text-right font-mono font-medium text-purple-600">
          {row.getValue<number>("porcentajeMeta").toFixed(2)}%
        </div>
      ),
    },
    {
      accessorKey: "votosQueRepresentaMeta",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Votos que Representa Meta" />,
      cell: ({ row }) => {
        const value = row.getValue<number>("votosQueRepresentaMeta")
        const actual = row.original.votosPartidoCoalicion
        return (
          <div className="text-right font-mono">
            <span className={`font-medium ${actual >= value ? "text-green-600" : "text-red-600"}`}>
              {value.toLocaleString()}
            </span>
            {actual < value && (
              <div className="text-xs text-muted-foreground">(+{(value - actual).toLocaleString()})</div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
      cell: ({ row }) => {
        const status = row.getValue<string>("status")
        const variants = {
          Alcanzada: "default",
          Cerca: "secondary",
          Lejana: "outline",
        } as const

        return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>
      },
    },
  ]

  // Exportar datos
  const exportToCSV = () => {
    const headers = [
      "Sección",
      "Distrito",
      "Municipio",
      "Total Votos Emitidos",
      "Votos Seleccionados",
      "% Actual",
      "% Meta",
      "Votos que Representa Meta",
      "Votos Adicionales Necesarios",
      "Estado",
      "Partidos/Coaliciones Seleccionados",
    ]

    const rows = filteredData.map((row) => [
      row.seccion,
      row.distrito,
      row.municipioNombre,
      row.totalVotosEmitidos,
      row.votosPartidoCoalicion,
      row.porcentajeActual.toFixed(2),
      row.porcentajeMeta.toFixed(2),
      row.votosQueRepresentaMeta,
      Math.max(0, row.votosQueRepresentaMeta - row.votosPartidoCoalicion),
      row.status,
      selectedPartidos.join(" + "),
    ])

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `metas_electorales_${selectedPartidos.join("_")}_${goalPercentage}pct.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltroDistrito("todos")
    setFiltroMunicipio("todos")
    setFiltroSeccion("")
    setFiltroStatus("todos")
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-8 text-center">
        <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No hay datos disponibles</h3>
        <p className="text-muted-foreground">Carga datos electorales para comenzar el análisis de metas.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Configuración Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Configuración de Meta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Selección múltiple de partidos/coaliciones */}
            <div className="space-y-3">
              <Label>Partidos/Coaliciones Seleccionados</Label>

              {/* Partidos seleccionados */}
              <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md">
                {selectedPartidos.length === 0 ? (
                  <span className="text-muted-foreground text-sm">Selecciona partidos o coaliciones...</span>
                ) : (
                  selectedPartidos.map((partido) => (
                    <Badge key={partido} variant="secondary" className="flex items-center gap-1">
                      {partido}
                      <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => removePartido(partido)} />
                    </Badge>
                  ))
                )}
              </div>

              {/* Botón para mostrar selector */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPartidoSelector(!showPartidoSelector)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                {showPartidoSelector ? "Ocultar Selector" : "Agregar Partidos/Coaliciones"}
              </Button>

              {/* Selector de partidos */}
              {showPartidoSelector && (
                <div className="space-y-3 p-3 border rounded-md bg-muted/20">
                  {/* Coaliciones predefinidas */}
                  {coaliciones.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Coaliciones Predefinidas:</Label>
                      <div className="grid grid-cols-1 gap-2">
                        {coaliciones.map((coalicion) => (
                          <Button
                            key={coalicion.nombre}
                            variant="outline"
                            size="sm"
                            onClick={() => addCoalicion(coalicion)}
                            className="justify-start text-xs"
                          >
                            <Plus className="h-3 w-3 mr-2" />
                            {coalicion.nombre} ({coalicion.partidos.join(", ")})
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Partidos individuales */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Partidos Individuales:</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {PARTIDOS_DISPONIBLES.map((partido) => (
                        <div key={partido} className="flex items-center space-x-2">
                          <Checkbox
                            id={partido}
                            checked={selectedPartidos.includes(partido)}
                            onCheckedChange={() => togglePartido(partido)}
                          />
                          <Label htmlFor={partido} className="text-xs cursor-pointer">
                            {partido}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Porcentaje Meta</Label>
                <span className="text-lg font-bold text-primary">{goalPercentage}%</span>
              </div>
              <Slider
                value={[goalPercentage]}
                onValueChange={(value) => setGoalPercentage(value[0])}
                min={1}
                max={100}
                step={0.1}
                className="py-4"
              />
              <div className="text-xs text-muted-foreground">
                <strong>Análisis:</strong> Suma de votos de {selectedPartidos.length} partido(s)/coalición(es)
                seleccionado(s) para alcanzar {goalPercentage}% del total de votos emitidos.
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Distrito</Label>
                <Select
                  value={filtroDistrito}
                  onValueChange={setFiltroDistrito}
                  disabled={opcionesFiltros.distritos.length === 0}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los distritos</SelectItem>
                    {opcionesFiltros.distritos.map((distrito) => (
                      <SelectItem key={distrito} value={distrito}>
                        Distrito {distrito}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Municipio</Label>
                <Select
                  value={filtroMunicipio}
                  onValueChange={setFiltroMunicipio}
                  disabled={opcionesFiltros.municipios.length === 0}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los municipios</SelectItem>
                    {opcionesFiltros.municipios.map((municipio) => (
                      <SelectItem key={municipio} value={municipio}>
                        {MUNICIPIOS_MAP[municipio] || municipio}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Sección</Label>
                <Input
                  placeholder="Buscar sección..."
                  value={filtroSeccion}
                  onChange={(e) => setFiltroSeccion(e.target.value)}
                  className="h-8"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Estado</Label>
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los estados</SelectItem>
                    <SelectItem value="Alcanzada">Alcanzada</SelectItem>
                    <SelectItem value="Cerca">Cerca</SelectItem>
                    <SelectItem value="Lejana">Lejana</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={limpiarFiltros} className="w-full">
              Limpiar Filtros
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SimpleStatCard
          title="Secciones"
          value={stats.total.toLocaleString()}
          description="Total analizadas"
          icon={<MapPin className="h-4 w-4" />}
        />

        <SimpleStatCard
          title="Metas Alcanzadas"
          value={stats.alcanzadas.toLocaleString()}
          description={`${stats.porcentajeExito.toFixed(1)}% de éxito`}
          icon={<CheckCircle2 className="h-4 w-4" />}
          trend={{
            value: stats.porcentajeExito,
            isPositive: stats.porcentajeExito >= 50,
            suffix: "%",
          }}
        />

        <SimpleStatCard
          title="% Promedio Actual"
          value={`${stats.porcentajePromedioActual.toFixed(2)}%`}
          description={`Meta: ${goalPercentage}%`}
          icon={<BarChart3 className="h-4 w-4" />}
          trend={{
            value: stats.porcentajePromedioActual - goalPercentage,
            isPositive: stats.porcentajePromedioActual >= goalPercentage,
            suffix: "pp",
          }}
        />

        <SimpleStatCard
          title="Votos Adicionales"
          value={stats.votosAdicionales.toLocaleString()}
          description="Necesarios para metas"
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      <Separator />

      {/* Tabla de Datos */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Análisis de Metas por Sección
              <Badge variant="secondary" className="ml-2">
                {filteredData.length} secciones
              </Badge>
              {selectedPartidos.length > 0 && (
                <Badge variant="outline" className="ml-2">
                  {selectedPartidos.join(" + ")}
                </Badge>
              )}
            </CardTitle>
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredData}
            searchColumn="seccion"
            searchPlaceholder="Buscar por sección..."
            pagination={true}
          />
        </CardContent>
      </Card>

      {/* Resumen de Prioridades */}
      {stats.cerca > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Secciones Prioritarias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Secciones que están cerca de alcanzar la meta porcentual para la combinación seleccionada:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredData
                .filter((d) => d.status === "Cerca")
                .slice(0, 6)
                .map((seccion, i) => (
                  <div key={i} className="p-3 border rounded-lg bg-amber-50 dark:bg-amber-950/20">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">Sección {seccion.seccion}</div>
                        <div className="text-xs text-muted-foreground">
                          Distrito {seccion.distrito} - {seccion.municipioNombre}
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                          {seccion.porcentajeActual.toFixed(2)}% → {seccion.porcentajeMeta}%
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        +{(seccion.votosQueRepresentaMeta - seccion.votosPartidoCoalicion).toLocaleString()} votos
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

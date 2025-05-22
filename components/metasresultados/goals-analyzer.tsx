"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { StatCard } from "@/components/ui/stat-card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { CardSpotlight } from "@/components/ui/card-spotlight"
import { Button } from "@/components/ui/button"
import { Download, TrendingUp, TrendingDown, Target, Award, AlertTriangle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { AlertCircle, ChevronDown, ChevronUp } from "lucide-react"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import type { ColumnDef } from "@tanstack/react-table"

interface GoalsAnalyzerProps {
  data: any[]
  partidos: string[]
  coaliciones: { nombre: string; partidos: string[]; color: string }[]
  selectedCoalition: string | null
  useCoalitionVotesForGoal?: boolean // Nuevo parámetro para usar votos de coalición en lugar del total
}

interface SectionData {
  seccion: string
  nombre: string
  distrito: string
  totalVotos: number
  votosCoalicion: number
  porcentajeActual: number
  metaPorcentaje: number
  votosNecesarios: number
  diferencia: number
}

export function GoalsAnalyzer({
  data,
  partidos,
  coaliciones,
  selectedCoalition,
  useCoalitionVotesForGoal = true, // Por defecto, usar votos de coalición para la meta
}: GoalsAnalyzerProps) {
  const [goalPercentage, setGoalPercentage] = useState<number>(36)
  const [selectedView, setSelectedView] = useState<string>("general")
  const [selectedSection, setSelectedSection] = useState("general")
  const [selectedDistrict, setSelectedDistrict] = useState("todos")
  const [sectionDataOld, setSectionData] = useState<SectionData[]>([])
  const [error, setError] = useState<string | null>(null)
  const [generalData, setGeneralData] = useState<{
    totalVotos: number
    votosCoalicion: number
    porcentajeActual: number
    metaPorcentaje: number
    votosNecesarios: number
    diferencia: number
  }>({
    totalVotos: 0,
    votosCoalicion: 0,
    porcentajeActual: 0,
    metaPorcentaje: 0,
    votosNecesarios: 0,
    diferencia: 0,
  })

  // Encontrar la coalición seleccionada
  const selectedCoalitionObj = useMemo(() => {
    return coaliciones.find((c) => c.nombre === selectedCoalition) || coaliciones[0]
  }, [coaliciones, selectedCoalition])

  // Calcular votos por coalición y totales
  const { coalitionVotes, totalVotes, listaNominal, sectionData, goalVotes, difference, goalPercentageOfTotal } =
    useMemo(() => {
      if (!data || data.length === 0 || !selectedCoalitionObj) {
        return {
          coalitionVotes: 0,
          totalVotes: 0,
          listaNominal: 0,
          sectionData: [],
          goalVotes: 0,
          difference: 0,
          goalPercentageOfTotal: 0,
        }
      }

      // Calcular votos totales y de la coalición
      let totalVotesSum = 0
      let coalitionVotesSum = 0
      let listaNominalSum = 0
      const sectionResults: any[] = []

      // Procesar cada fila de datos
      data.forEach((row) => {
        // Sumar lista nominal
        if (row.LISTA_NOMINAL) {
          const listaNominal = Number(row.LISTA_NOMINAL) || 0
          if (!isNaN(listaNominal)) {
            listaNominalSum += listaNominal
          }
        }

        // Calcular votos totales y de la coalición para esta sección
        let sectionTotalVotes = 0
        let sectionCoalitionVotes = 0

        // Procesar cada partido/coalición en la fila
        Object.entries(row).forEach(([key, value]) => {
          // Excluir columnas que no son partidos/coaliciones
          if (
            key !== "SECCION" &&
            key !== "CASILLA" &&
            key !== "DISTRITO" &&
            key !== "MUNICIPIO" &&
            key !== "LOCALIDAD" &&
            key !== "LISTA_NOMINAL" &&
            key !== "TOTAL_VOTOS"
          ) {
            const votes = Number(value) || 0

            // Sumar al total de votos de la sección
            sectionTotalVotes += votes

            // Verificar si este partido/coalición pertenece a la coalición seleccionada
            if (selectedCoalitionObj.partidos.includes(key)) {
              sectionCoalitionVotes += votes
            }
          }
        })

        // Si no se calcularon votos totales pero existe TOTAL_VOTOS, usarlo
        if (sectionTotalVotes === 0 && row.TOTAL_VOTOS) {
          sectionTotalVotes = Number(row.TOTAL_VOTOS) || 0
        }

        // Sumar a los totales generales
        totalVotesSum += sectionTotalVotes
        coalitionVotesSum += sectionCoalitionVotes

        // Agregar datos de esta sección
        sectionResults.push({
          seccion: row.SECCION,
          distrito: row.DISTRITO || "No especificado",
          municipio: row.MUNICIPIO || "No especificado",
          totalVotos: sectionTotalVotes,
          coalitionVotos: sectionCoalitionVotes,
          porcentajeCoalicion: sectionTotalVotes > 0 ? (sectionCoalitionVotes / sectionTotalVotes) * 100 : 0,
          listaNominal: Number(row.LISTA_NOMINAL) || 0,
        })
      })

      // Calcular votos meta y diferencia
      // Si useCoalitionVotesForGoal es true, calcular la meta sobre los votos de la coalición
      // Si es false, calcular sobre el total de votos
      const baseForGoal = useCoalitionVotesForGoal ? coalitionVotesSum : totalVotesSum
      const goalVotesValue = Math.ceil((baseForGoal * goalPercentage) / 100)
      const differenceValue = coalitionVotesSum - goalVotesValue

      // Calcular qué porcentaje del total representaría la meta
      const goalPercentageOfTotalValue = totalVotesSum > 0 ? (goalVotesValue / totalVotesSum) * 100 : 0

      return {
        coalitionVotes: coalitionVotesSum,
        totalVotes: totalVotesSum,
        listaNominal: listaNominalSum,
        sectionData: sectionResults,
        goalVotes: goalVotesValue,
        difference: differenceValue,
        goalPercentageOfTotal: goalPercentageOfTotalValue,
      }
    }, [data, selectedCoalitionObj, goalPercentage, useCoalitionVotesForGoal])

  // Ordenar secciones por porcentaje de la coalición (de menor a mayor)
  const sortedSections = useMemo(() => {
    return [...sectionData].sort((a, b) => a.porcentajeCoalicion - b.porcentajeCoalicion)
  }, [sectionData])

  // Secciones prioritarias (con menor porcentaje de la coalición)
  const prioritySections = useMemo(() => {
    return sortedSections.slice(0, 10)
  }, [sortedSections])

  // Extraer distritos únicos de los datos
  const distritos = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return ["todos"]

    try {
      const distritosSet = new Set<string>()
      distritosSet.add("todos")

      data.forEach((item) => {
        if (item.DISTRITO) {
          distritosSet.add(item.DISTRITO)
        }
      })

      return Array.from(distritosSet)
    } catch (err) {
      console.error("Error al extraer distritos:", err)
      setError("Error al procesar los distritos. Verifica el formato de los datos.")
      return ["todos"]
    }
  }, [data])

  // Extraer secciones únicas de los datos
  const secciones = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return ["general", "all-table"]

    try {
      const seccionesSet = new Set<string>()
      seccionesSet.add("general")
      seccionesSet.add("all-table")

      // Filtrar por distrito si es necesario
      const filteredData =
        selectedDistrict === "todos" ? data : data.filter((item) => item.DISTRITO === selectedDistrict)

      filteredData.forEach((item) => {
        if (item.SECCION) {
          seccionesSet.add(item.SECCION.toString())
        }
      })

      return Array.from(seccionesSet)
    } catch (err) {
      console.error("Error al extraer secciones:", err)
      setError("Error al procesar las secciones. Verifica el formato de los datos.")
      return ["general", "all-table"]
    }
  }, [data, selectedDistrict])

  // Calcular datos generales y por sección
  // useEffect(() => {
  //   if (!data || !Array.isArray(data) || data.length === 0 || !selectedCoalition) {
  //     setError("No hay datos disponibles o no se ha seleccionado una coalición")
  //     return
  //   }

  //   try {
  //     setError(null)

  //     // Filtrar por distrito si es necesario
  //     const filteredData =
  //       selectedDistrict === "todos" ? data : data.filter((item) => item.DISTRITO === selectedDistrict)

  //     if (filteredData.length === 0) {
  //       setError("No hay datos para el distrito seleccionado")
  //       return
  //     }

  //     // Calcular datos generales
  //     const totalVotos = filteredData.reduce((sum, item) => {
  //       // Intentar obtener el total de votos de diferentes maneras
  //       const itemTotal =
  //         item.TOTAL_VOTOS ||
  //         Object.entries(item)
  //           .filter(
  //             ([key]) =>
  //               key !== "SECCION" &&
  //               key !== "DISTRITO" &&
  //               key !== "MUNICIPIO" &&
  //               key !== "LISTA_NOMINAL" &&
  //               key !== "CASILLA" &&
  //               key !== "LOCALIDAD",
  //           )
  //           .reduce((total, [_, value]) => total + (Number(value) || 0), 0)

  //       return sum + (itemTotal || 0)
  //     }, 0)

  //     // Encontrar la coalición seleccionada
  //     const coalicionSeleccionada = coaliciones.find((c) => c.nombre === selectedCoalition)

  //     if (!coalicionSeleccionada) {
  //       setError(`No se encontró la coalición "${selectedCoalition}"`)
  //       return
  //     }

  //     const votosCoalicion = filteredData.reduce((sum, item) => {
  //       const partidosCoalicion = coalicionSeleccionada.partidos || []
  //       const votosPartidos = partidosCoalicion.reduce((total, partido) => {
  //         return total + (Number(item[partido]) || 0)
  //       }, 0)
  //       return sum + votosPartidos
  //     }, 0)

  //     const porcentajeActual = totalVotos > 0 ? (votosCoalicion / totalVotos) * 100 : 0
  //     const metaPorcentaje = goalPercentage
  //     const votosNecesariosParaMeta = Math.ceil((metaPorcentaje / 100) * totalVotos)
  //     const diferencia = votosNecesariosParaMeta - votosCoalicion

  //     setGeneralData({
  //       totalVotos,
  //       votosCoalicion,
  //       porcentajeActual,
  //       metaPorcentaje,
  //       votosNecesarios: votosNecesariosParaMeta,
  //       diferencia,
  //     })

  //     // Calcular datos por sección
  //     const sectionDataArray = filteredData.map((item) => {
  //       const seccion = item.SECCION?.toString() || ""
  //       const nombre = item.NOMBRE || `Sección ${seccion}`
  //       const distrito = item.DISTRITO || "No especificado"

  //       // Intentar obtener el total de votos de diferentes maneras
  //       const totalVotosSeccion =
  //         item.TOTAL_VOTOS ||
  //         Object.entries(item)
  //           .filter(
  //             ([key]) =>
  //               key !== "SECCION" &&
  //               key !== "DISTRITO" &&
  //               key !== "MUNICIPIO" &&
  //               key !== "LISTA_NOMINAL" &&
  //               key !== "CASILLA" &&
  //               key !== "LOCALIDAD",
  //           )
  //           .reduce((total, [_, value]) => total + (Number(value) || 0), 0)

  //       const partidosCoalicion = coalicionSeleccionada.partidos || []
  //       const votosCoalicionSeccion = partidosCoalicion.reduce((total, partido) => {
  //         return total + (Number(item[partido]) || 0)
  //       }, 0)

  //       const porcentajeActualSeccion = totalVotosSeccion > 0 ? (votosCoalicionSeccion / totalVotosSeccion) * 100 : 0
  //       const votosNecesariosParaMetaSeccion = Math.ceil((metaPorcentaje / 100) * totalVotosSeccion)
  //       const diferenciaSeccion = votosNecesariosParaMetaSeccion - votosCoalicionSeccion

  //       return {
  //         seccion,
  //         nombre,
  //         distrito,
  //         totalVotos: totalVotosSeccion,
  //         votosCoalicion: votosCoalicionSeccion,
  //         porcentajeActual: porcentajeActualSeccion,
  //         metaPorcentaje,
  //         votosNecesarios: votosNecesariosParaMetaSeccion,
  //         diferencia: diferenciaSeccion,
  //       }
  //     })

  //     setSectionData(sectionDataArray)
  //   } catch (err) {
  //     console.error("Error al calcular datos:", err)
  //     setError("Error al procesar los datos. Verifica el formato del archivo CSV.")
  //   }
  // }, [data, selectedCoalition, coaliciones, goalPercentage, selectedDistrict])

  // Exportar datos a CSV
  const exportToCSV = () => {
    if (sectionData.length === 0) return

    // Crear encabezados
    const headers = [
      "Sección",
      "Distrito",
      "Municipio",
      "Total Votos",
      `Votos ${selectedCoalitionObj?.nombre || "Coalición"}`,
      "% Coalición",
      "Lista Nominal",
      "Meta",
      "Diferencia",
    ]

    // Crear filas de datos
    const rows = sectionData.map((section) => {
      const sectionGoal = Math.ceil((section.totalVotos * goalPercentage) / 100)
      const sectionDiff = section.coalitionVotos - sectionGoal

      return [
        section.seccion,
        section.distrito,
        section.municipio,
        section.totalVotos,
        section.coalitionVotos,
        section.porcentajeCoalicion.toFixed(2),
        section.listaNominal,
        sectionGoal,
        sectionDiff,
      ]
    })

    // Combinar encabezados y filas
    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n")

    // Crear y descargar el archivo
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `metas_${selectedCoalitionObj?.nombre || "coalicion"}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Exportar datos a CSV
  // const exportToCSVOld = () => {
  //   if (!data || !Array.isArray(data) || data.length === 0) {
  //     setError("No hay datos para exportar")
  //     return
  //   }

  //   try {
  //     let csvContent = "data:text/csv;charset=utf-8,"

  //     // Encabezados
  //     csvContent += "Sección,Nombre,Distrito,Total Votos,Votos Coalición,% Actual,Meta %,Votos Necesarios,Diferencia\n"

  //     // Datos
  //     sectionData.forEach((item) => {
  //       csvContent += `${item.seccion},${item.nombre},${item.distrito},${item.totalVotos},${item.votosCoalicion},${item.porcentajeActual.toFixed(2)},${item.metaPorcentaje},${item.votosNecesarios},${item.diferencia}\n`
  //     })

  //     // Crear enlace de descarga
  //     const encodedUri = encodeURI(csvContent)
  //     const link = document.createElement("a")
  //     link.setAttribute("href", encodedUri)
  //     link.setAttribute(
  //       "download",
  //       `metas_electorales_${selectedCoalition?.replace(/\s+/g, "_")}_${selectedDistrict !== "todos" ? selectedDistrict + "_" : ""}${new Date().toISOString().split("T")[0]}.csv`,
  //     )
  //     document.body.appendChild(link)
  //     link.click()
  //     document.body.removeChild(link)
  //   } catch (err) {
  //     console.error("Error al exportar datos:", err)
  //     setError("Error al exportar los datos a CSV")
  //   }
  // }

  // Definición de columnas para la tabla de secciones
  const columns: ColumnDef<SectionData>[] = [
    {
      accessorKey: "seccion",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Sección" />,
    },
    {
      accessorKey: "nombre",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
    },
    {
      accessorKey: "distrito",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Distrito" />,
    },
    {
      accessorKey: "totalVotos",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Total Votos" />,
      cell: ({ row }) => <div className="text-right">{row.getValue("totalVotos")}</div>,
    },
    {
      accessorKey: "votosCoalicion",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Votos Coalición" />,
      cell: ({ row }) => <div className="text-right">{row.getValue("votosCoalicion")}</div>,
    },
    {
      accessorKey: "porcentajeActual",
      header: ({ column }) => <DataTableColumnHeader column={column} title="% Actual" />,
      cell: ({ row }) => {
        const value = row.getValue("porcentajeActual") as number
        return <div className="text-right">{value.toFixed(2)}%</div>
      },
    },
    {
      accessorKey: "metaPorcentaje",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Meta %" />,
      cell: ({ row }) => <div className="text-right">{row.getValue("metaPorcentaje")}%</div>,
    },
    {
      accessorKey: "votosNecesarios",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Votos Necesarios" />,
      cell: ({ row }) => <div className="text-right">{row.getValue("votosNecesarios")}</div>,
    },
    {
      accessorKey: "diferencia",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Diferencia" />,
      cell: ({ row }) => {
        const value = row.getValue("diferencia") as number
        return (
          <div className={`text-right font-medium ${value > 0 ? "text-red-500" : "text-green-500"}`}>
            {value > 0 ? `+${value}` : value}
            {value > 0 ? (
              <ChevronUp className="inline ml-1 h-4 w-4" />
            ) : (
              <ChevronDown className="inline ml-1 h-4 w-4" />
            )}
          </div>
        )
      },
    },
  ]

  // Filtrar datos para la sección seleccionada
  const selectedSectionData = useMemo(() => {
    if (selectedSection === "general" || selectedSection === "all-table") {
      return null
    }
    return sectionDataOld.find((item) => item.seccion === selectedSection) || null
  }, [sectionDataOld, selectedSection])

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No hay datos disponibles para analizar</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Por favor, carga datos electorales para comenzar el análisis.
        </p>
      </div>
    )
  }

  if (!selectedCoalition) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No se ha seleccionado una coalición</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Por favor, selecciona una coalición en la pestaña "Coaliciones" para comenzar el análisis.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Meta de Porcentaje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Porcentaje de meta:</span>
                <span className="font-medium text-lg">{goalPercentage}%</span>
              </div>
              <Slider
                value={[goalPercentage]}
                onValueChange={(value) => setGoalPercentage(value[0])}
                min={1}
                max={100}
                step={1}
                className="py-4"
              />
              <div className="text-xs text-muted-foreground">
                {useCoalitionVotesForGoal ? (
                  <p>
                    Meta: Incrementar los votos de la coalición en un {goalPercentage}% sobre los votos actuales de la
                    coalición.
                  </p>
                ) : (
                  <p>Meta: Obtener el {goalPercentage}% del total de votos para la coalición.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Coalición Seleccionada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Coalición:</span>
                <span className="font-medium">{selectedCoalitionObj?.nombre || "No seleccionada"}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedCoalitionObj?.partidos.map((partido) => (
                  <Badge key={partido} variant="outline">
                    {partido}
                  </Badge>
                ))}
              </div>
              <div className="text-xs text-muted-foreground">
                <p>Porcentaje actual: {((coalitionVotes / totalVotes) * 100).toFixed(2)}% del total de votos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total de Votos"
          value={totalVotes}
          description="En todas las secciones"
          icon={<Award className="h-4 w-4 text-blue-500" />}
          trend={null}
        />
        <StatCard
          title="Votos Coalición"
          value={coalitionVotes}
          description={`${((coalitionVotes / totalVotes) * 100).toFixed(2)}% del total`}
          icon={<Target className="h-4 w-4 text-purple-500" />}
          trend={null}
        />
        <StatCard
          title="Meta"
          value={goalVotes}
          description={
            useCoalitionVotesForGoal
              ? `${goalPercentage}% de los votos de la coalición`
              : `${goalPercentageOfTotal.toFixed(2)}% del total de votos`
          }
          icon={<TrendingUp className="h-4 w-4 text-green-500" />}
          trend={null}
        />
        <StatCard
          title="Diferencia"
          value={Math.abs(difference)}
          description={`Votos ${difference >= 0 ? "por encima" : "por debajo"} de la meta`}
          icon={
            difference >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )
          }
          trend={difference >= 0 ? "up" : "down"}
        />
      </div>

      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h3 className="text-lg font-medium">Análisis por Sección</h3>
          <p className="text-sm text-muted-foreground">Secciones ordenadas por prioridad para alcanzar la meta</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center space-x-2">
            <Label htmlFor="view-selector" className="text-sm">
              Vista:
            </Label>
            <Select value={selectedView} onValueChange={setSelectedView}>
              <SelectTrigger id="view-selector" className="w-[140px]">
                <SelectValue placeholder="Seleccionar vista" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="priority">Secciones Prioritarias</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exportar a CSV
          </Button>
        </div>
      </div>

      {sectionData.length === 0 ? (
        <Card className="p-6 text-center">
          <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No hay datos disponibles</h3>
          <p className="text-sm text-muted-foreground">
            No se encontraron datos para los filtros seleccionados. Intenta con otros filtros.
          </p>
        </Card>
      ) : (
        <CardSpotlight>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px] rounded-md border">
              <div className="p-4">
                <table className="w-full">
                  <thead className="sticky top-0 bg-background z-10">
                    <tr className="border-b">
                      <th className="text-left p-2 text-xs font-medium text-muted-foreground">Sección</th>
                      <th className="text-left p-2 text-xs font-medium text-muted-foreground">Distrito</th>
                      <th className="text-left p-2 text-xs font-medium text-muted-foreground">Municipio</th>
                      <th className="text-right p-2 text-xs font-medium text-muted-foreground">Total Votos</th>
                      <th className="text-right p-2 text-xs font-medium text-muted-foreground">Votos Coalición</th>
                      <th className="text-right p-2 text-xs font-medium text-muted-foreground">% Coalición</th>
                      <th className="text-right p-2 text-xs font-medium text-muted-foreground">Meta</th>
                      <th className="text-right p-2 text-xs font-medium text-muted-foreground">Diferencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedView === "priority" ? prioritySections : sortedSections).map((section, index) => {
                      // Calcular meta y diferencia para esta sección
                      const sectionGoalBase = useCoalitionVotesForGoal ? section.coalitionVotos : section.totalVotos
                      const sectionGoal = Math.ceil((sectionGoalBase * goalPercentage) / 100)
                      const sectionDiff = section.coalitionVotos - sectionGoal

                      return (
                        <tr
                          key={`${section.seccion}-${index}`}
                          className="border-b hover:bg-muted/30 transition-colors"
                        >
                          <td className="p-2 text-sm">{section.seccion}</td>
                          <td className="p-2 text-sm">{section.distrito}</td>
                          <td className="p-2 text-sm">{section.municipio}</td>
                          <td className="p-2 text-sm text-right">
                            <AnimatedCounter value={section.totalVotos} />
                          </td>
                          <td className="p-2 text-sm text-right">
                            <AnimatedCounter value={section.coalitionVotos} />
                          </td>
                          <td className="p-2 text-sm text-right">{section.porcentajeCoalicion.toFixed(2)}%</td>
                          <td className="p-2 text-sm text-right">
                            <AnimatedCounter value={sectionGoal} />
                          </td>
                          <td
                            className={`p-2 text-sm text-right ${sectionDiff >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {sectionDiff >= 0 ? "+" : ""}
                            <AnimatedCounter value={sectionDiff} />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </ScrollArea>
          </CardContent>
        </CardSpotlight>
      )}
    </div>
  )
}

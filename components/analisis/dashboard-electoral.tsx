"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { CardSpotlight } from "@/components/ui/card-spotlight"
import { StatCard } from "@/components/ui/stat-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, TrendingUp, Users, MapPin, Vote } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ResultadosElectorales {
  totalVotos: number
  totalListaNominal: number
  totalCasillas: number
  participacion: number
  resultadosPorPartido: Array<{
    nombre: string
    siglas: string
    votos: number
    porcentaje: number
    color: string
  }>
  resultadosPorDistrito: Array<{
    nombre: string
    votos: number
    listaNominal: number
    casillas: number
  }>
  resultadosPorMunicipio: Array<{
    nombre: string
    votos: number
    listaNominal: number
    casillas: number
  }>
  coaliciones: Record<
    string,
    {
      votos: number
      porcentaje: number
      partidos: string[]
    }
  >
}

export function DashboardElectoral() {
  const [resultados, setResultados] = useState<ResultadosElectorales | null>(null)
  const [loading, setLoading] = useState(true)
  const [filtros, setFiltros] = useState({
    distritoFederal: "",
    distritoLocal: "",
    municipio: "",
    seccion: "",
  })
  const { toast } = useToast()

  const cargarResultados = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filtros).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const response = await fetch(`/api/analisis/resultados-electorales?${params}`)
      if (!response.ok) {
        throw new Error("Error al cargar resultados")
      }

      const data = await response.json()
      setResultados(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los resultados electorales",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarResultados()
  }, [])

  const aplicarFiltros = () => {
    cargarResultados()
  }

  const limpiarFiltros = () => {
    setFiltros({
      distritoFederal: "",
      distritoLocal: "",
      municipio: "",
      seccion: "",
    })
    setTimeout(() => cargarResultados(), 100)
  }

  const exportarResultados = () => {
    if (!resultados) return

    const csvData = [
      ["Partido/Coalición", "Votos", "Porcentaje"],
      ...resultados.resultadosPorPartido.map((p) => [p.nombre, p.votos, p.porcentaje.toFixed(2) + "%"]),
      ["", "", ""],
      ["Coaliciones", "", ""],
      ...Object.entries(resultados.coaliciones).map(([nombre, data]) => [
        nombre,
        data.votos,
        data.porcentaje.toFixed(2) + "%",
      ]),
    ]

    const csvContent = csvData.map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `resultados_electorales_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (!resultados) {
    return (
      <Alert>
        <AlertDescription>
          No se pudieron cargar los resultados electorales. Verifica que existan datos importados.
        </AlertDescription>
      </Alert>
    )
  }

  const coloresCoaliciones = {
    "Va por México": "#6B46C1",
    "Juntos Haremos Historia": "#9F7AEA",
    "Movimiento Ciudadano": "#F59E0B",
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Análisis</CardTitle>
          <CardDescription>Filtra los resultados por ubicación geográfica</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <Select
              value={filtros.distritoFederal}
              onValueChange={(value) => setFiltros((prev) => ({ ...prev, distritoFederal: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Distrito Federal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {/* Aquí se cargarían los distritos federales disponibles */}
              </SelectContent>
            </Select>

            <Select
              value={filtros.distritoLocal}
              onValueChange={(value) => setFiltros((prev) => ({ ...prev, distritoLocal: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Distrito Local" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {/* Aquí se cargarían los distritos locales disponibles */}
              </SelectContent>
            </Select>

            <Select
              value={filtros.municipio}
              onValueChange={(value) => setFiltros((prev) => ({ ...prev, municipio: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Municipio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {/* Aquí se cargarían los municipios disponibles */}
              </SelectContent>
            </Select>

            <Select
              value={filtros.seccion}
              onValueChange={(value) => setFiltros((prev) => ({ ...prev, seccion: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sección" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                {/* Aquí se cargarían las secciones disponibles */}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button onClick={aplicarFiltros}>Aplicar Filtros</Button>
            <Button variant="outline" onClick={limpiarFiltros}>
              Limpiar
            </Button>
            <Button variant="outline" onClick={exportarResultados} className="ml-auto">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <CardSpotlight>
          <StatCard
            title="Total de Votos"
            value={resultados.totalVotos.toLocaleString()}
            description="Votos válidos emitidos"
            icon={<Vote className="h-4 w-4" />}
            className="border-0"
          />
        </CardSpotlight>

        <CardSpotlight>
          <StatCard
            title="Lista Nominal"
            value={resultados.totalListaNominal.toLocaleString()}
            description="Ciudadanos registrados"
            icon={<Users className="h-4 w-4" />}
            className="border-0"
          />
        </CardSpotlight>

        <CardSpotlight>
          <StatCard
            title="Participación"
            value={`${resultados.participacion.toFixed(2)}%`}
            description="Porcentaje de participación"
            icon={<TrendingUp className="h-4 w-4" />}
            className="border-0"
          />
        </CardSpotlight>

        <CardSpotlight>
          <StatCard
            title="Casillas"
            value={resultados.totalCasillas.toLocaleString()}
            description="Casillas procesadas"
            icon={<MapPin className="h-4 w-4" />}
            className="border-0"
          />
        </CardSpotlight>
      </div>

      <Tabs defaultValue="partidos" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="partidos">Partidos</TabsTrigger>
          <TabsTrigger value="coaliciones">Coaliciones</TabsTrigger>
          <TabsTrigger value="geografico">Por Región</TabsTrigger>
          <TabsTrigger value="comparativo">Comparativo</TabsTrigger>
        </TabsList>

        <TabsContent value="partidos" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CardSpotlight>
              <CardHeader>
                <CardTitle>Resultados por Partido</CardTitle>
                <CardDescription>Distribución de votos por partido político</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={resultados.resultadosPorPartido}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="siglas" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => [value.toLocaleString(), "Votos"]} />
                    <Bar dataKey="votos" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </CardSpotlight>

            <CardSpotlight>
              <CardHeader>
                <CardTitle>Distribución Porcentual</CardTitle>
                <CardDescription>Porcentaje de votos por partido</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={resultados.resultadosPorPartido}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ siglas, porcentaje }) => `${siglas} ${porcentaje.toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="votos"
                    >
                      {resultados.resultadosPorPartido.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [value.toLocaleString(), "Votos"]} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </CardSpotlight>
          </div>

          <CardSpotlight>
            <CardHeader>
              <CardTitle>Detalle de Resultados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {resultados.resultadosPorPartido.map((partido) => (
                  <div key={partido.siglas} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: partido.color }} />
                      <div>
                        <div className="font-semibold">{partido.siglas}</div>
                        <div className="text-sm text-muted-foreground">{partido.nombre}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{partido.votos.toLocaleString()}</div>
                      <Badge variant="secondary">{partido.porcentaje.toFixed(2)}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </CardSpotlight>
        </TabsContent>

        <TabsContent value="coaliciones" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CardSpotlight>
              <CardHeader>
                <CardTitle>Resultados por Coalición</CardTitle>
                <CardDescription>Votos agrupados por coaliciones principales</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={Object.entries(resultados.coaliciones).map(([nombre, data]) => ({
                      nombre,
                      votos: data.votos,
                      porcentaje: data.porcentaje,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nombre" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => [value.toLocaleString(), "Votos"]} />
                    <Bar dataKey="votos" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </CardSpotlight>

            <CardSpotlight>
              <CardHeader>
                <CardTitle>Comparación de Coaliciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(resultados.coaliciones).map(([nombre, data]) => (
                    <div key={nombre} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{nombre}</span>
                        <span className="text-sm text-muted-foreground">
                          {data.votos.toLocaleString()} votos ({data.porcentaje.toFixed(2)}%)
                        </span>
                      </div>
                      <Progress
                        value={data.porcentaje}
                        className="h-2"
                        style={{
                          backgroundColor: coloresCoaliciones[nombre as keyof typeof coloresCoaliciones],
                        }}
                      />
                      <div className="text-xs text-muted-foreground">Partidos: {data.partidos.join(", ")}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </CardSpotlight>
          </div>
        </TabsContent>

        <TabsContent value="geografico" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CardSpotlight>
              <CardHeader>
                <CardTitle>Resultados por Distrito</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {resultados.resultadosPorDistrito.map((distrito) => (
                    <div key={distrito.nombre} className="flex justify-between items-center p-2 border rounded">
                      <span className="font-medium">{distrito.nombre}</span>
                      <div className="text-right">
                        <div className="font-semibold">{distrito.votos.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">{distrito.casillas} casillas</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </CardSpotlight>

            <CardSpotlight>
              <CardHeader>
                <CardTitle>Resultados por Municipio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {resultados.resultadosPorMunicipio.map((municipio) => (
                    <div key={municipio.nombre} className="flex justify-between items-center p-2 border rounded">
                      <span className="font-medium">{municipio.nombre}</span>
                      <div className="text-right">
                        <div className="font-semibold">{municipio.votos.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">{municipio.casillas} casillas</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </CardSpotlight>
          </div>
        </TabsContent>

        <TabsContent value="comparativo" className="space-y-4">
          <CardSpotlight>
            <CardHeader>
              <CardTitle>Análisis Comparativo</CardTitle>
              <CardDescription>Comparación entre partidos y coaliciones principales</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(resultados.coaliciones).map(([nombre, data]) => (
                  <div key={nombre} className="text-center p-4 border rounded-lg">
                    <div
                      className="text-2xl font-bold"
                      style={{ color: coloresCoaliciones[nombre as keyof typeof coloresCoaliciones] }}
                    >
                      {data.porcentaje.toFixed(1)}%
                    </div>
                    <div className="font-medium">{nombre}</div>
                    <div className="text-sm text-muted-foreground">{data.votos.toLocaleString()} votos</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </CardSpotlight>
        </TabsContent>
      </Tabs>
    </div>
  )
}

"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
  LineChart,
  Line
} from 'recharts'
import { BarChart3, PieChartIcon, TrendingUp, Download, Flag } from 'lucide-react'

interface ElectoralResultsChartProps {
  data: any[]
}

// Partidos y coaliciones mexicanos específicos
const MEXICAN_PARTIES = [
  'PAN', 'PVEM_PT', 'PRI', 'PVEM', 'NO_REGISTRADAS', 'NULOS', 'PT', 'MC', 'PRD',
  'PAN-PRI-PRD', 'PAN-PRI', 'PAN-PRD', 'PRI-PRD', 'PVEM_PT_MORENA', 'PVEM_MORENA',
  'PT_MORENA', 'MORENA'
]

// Colores específicos para partidos mexicanos
const PARTY_COLORS: Record<string, string> = {
  'PAN': '#0066CC',           // Azul
  'PRI': '#FF0000',           // Rojo
  'PRD': '#FFFF00',           // Amarillo
  'PVEM': '#00AA00',          // Verde
  'PT': '#CC0000',            // Rojo oscuro
  'MC': '#FF6600',            // Naranja
  'MORENA': '#8B4513',        // Café/Marrón
  'NULOS': '#808080',         // Gris
  'NO_REGISTRADAS': '#C0C0C0', // Gris claro
  'PVEM_PT': '#66AA66',       // Verde claro
  'PAN-PRI-PRD': '#6666CC',   // Azul-Rojo-Amarillo mezclado
  'PAN-PRI': '#8033CC',       // Azul-Rojo
  'PAN-PRD': '#80CC33',       // Azul-Amarillo
  'PRI-PRD': '#FF8000',       // Rojo-Amarillo
  'PVEM_PT_MORENA': '#4D7A4D', // Verde-Café
  'PVEM_MORENA': '#5D8A5D',   // Verde-Café claro
  'PT_MORENA': '#A0522D'      // Rojo-Café
}

const DEFAULT_COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00',
  '#ff00ff', '#00ffff', '#ff0000', '#0000ff', '#ffff00',
  '#800080', '#008000', '#ffa500', '#ffc0cb', '#a52a2a'
]

// Nombres completos de partidos
const PARTY_NAMES: Record<string, string> = {
  'PAN': 'Partido Acción Nacional',
  'PRI': 'Partido Revolucionario Institucional',
  'PRD': 'Partido de la Revolución Democrática',
  'PVEM': 'Partido Verde Ecologista de México',
  'PT': 'Partido del Trabajo',
  'MC': 'Movimiento Ciudadano',
  'MORENA': 'Movimiento Regeneración Nacional',
  'PVEM_PT': 'Coalición PVEM-PT',
  'NO_REGISTRADAS': 'Candidaturas No Registradas',
  'NULOS': 'Votos Nulos'
}

export function ElectoralResultsChart({ data }: ElectoralResultsChartProps) {
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>("all")
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all")
  const [chartType, setChartType] = useState<string>("all_parties")

  // Procesar datos para gráficos
  const processedData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return {
        parties: [],
        sections: [],
        municipalities: [],
        districts: [],
        municipalityList: [],
        districtList: [],
        coalitions: [],
        mainParties: []
      }
    }

    // Filtrar datos según selección
    let filteredData = [...data]

    if (selectedMunicipality !== "all") {
      filteredData = filteredData.filter(row =>
        (row.MUNICIPIO || row.municipio) === selectedMunicipality
      )
    }

    if (selectedDistrict !== "all") {
      filteredData = filteredData.filter(row =>
        (row.DISTRITO || row.distrito) === selectedDistrict
      )
    }

    // Verificar que filteredData sigue siendo un array
    if (!Array.isArray(filteredData)) {
      filteredData = []
    }

    // Calcular totales por partido
    const partyTotals = MEXICAN_PARTIES.map(party => {
      const total = filteredData.reduce((sum, row) => {
        const votes = Number(row[party]) || 0
        return sum + votes
      }, 0)

      return {
        name: party,
        fullName: PARTY_NAMES[party] || party,
        votes: total,
        percentage: 0,
        color: PARTY_COLORS[party] || DEFAULT_COLORS[MEXICAN_PARTIES.indexOf(party) % DEFAULT_COLORS.length],
        isCoalition: party.includes('-') || party.includes('_'),
        type: party === 'NULOS' ? 'null' :
          party === 'NO_REGISTRADAS' ? 'non_registered' :
            party.includes('-') || party.includes('_') ? 'coalition' : 'party'
      }
    }).filter(party => party.votes > 0)

    const totalVotes = partyTotals.reduce((sum, party) => sum + party.votes, 0)
    partyTotals.forEach(party => {
      party.percentage = totalVotes > 0 ? (party.votes / totalVotes) * 100 : 0
    })

    // Ordenar por votos
    partyTotals.sort((a, b) => b.votes - a.votes)

    // Separar partidos principales de coaliciones
    const mainParties = partyTotals.filter(p => p.type === 'party')
    const coalitions = partyTotals.filter(p => p.type === 'coalition')

    // Datos por sección (primeras 20 secciones)
    const sectionData = filteredData.slice(0, 20).map(row => {
      const sectionResult: any = {
        seccion: row.SECCION || row.seccion || 'S/N',
        municipio: row.MUNICIPIO || row.municipio || 'N/A',
        total: 0,
        listaNominal: Number(row.LISTA_NOMINAL) || 0
      }

      MEXICAN_PARTIES.forEach(party => {
        const votes = Number(row[party]) || 0
        sectionResult[party] = votes
        sectionResult.total += votes
      })

      sectionResult.participation = sectionResult.listaNominal > 0
        ? (sectionResult.total / sectionResult.listaNominal) * 100
        : 0

      return sectionResult
    })

    // Datos por municipio
    const municipalityMap = new Map()
    filteredData.forEach(row => {
      const municipality = row.MUNICIPIO || row.municipio || 'Sin especificar'
      if (!municipalityMap.has(municipality)) {
        municipalityMap.set(municipality, {
          name: municipality,
          total: 0,
          listaNominal: 0,
          parties: {}
        })
      }

      const munData = municipalityMap.get(municipality)
      munData.listaNominal += Number(row.LISTA_NOMINAL) || 0

      MEXICAN_PARTIES.forEach(party => {
        const votes = Number(row[party]) || 0
        if (!munData.parties[party]) {
          munData.parties[party] = 0
        }
        munData.parties[party] += votes
        munData.total += votes
      })
    })

    const municipalityData = Array.from(municipalityMap.values())
      .map(mun => {
        mun.participation = mun.listaNominal > 0 ? (mun.total / mun.listaNominal) * 100 : 0
        return mun
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)

    // Obtener listas únicas para filtros
    const municipalities = [...new Set(data.map(row => row.MUNICIPIO || row.municipio).filter(Boolean))]
    const districts = [...new Set(data.map(row => row.DISTRITO || row.distrito).filter(Boolean))]

    return {
      parties: partyTotals,
      mainParties,
      coalitions,
      sections: sectionData,
      municipalities: municipalityData,
      municipalityList: municipalities,
      districtList: districts
    }
  }, [data, selectedMunicipality, selectedDistrict])

  const getChartData = () => {
    switch (chartType) {
      case 'main_parties':
        return processedData.mainParties
      case 'coalitions':
        return processedData.coalitions
      case 'top_10':
        return processedData.parties.slice(0, 10)
      default:
        return processedData.parties
    }
  }

  const exportChart = (chartType: string) => {
    console.log(`Exportando gráfico: ${chartType}`)
    // Implementar exportación real aquí
  }

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5" />
            Gráficos de Resultados Electorales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay datos disponibles para generar gráficos</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartData = getChartData()

  return (
    <div className="space-y-6">
      {/* Filtros y controles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Configuración de Visualización
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Municipio</label>
              <Select value={selectedMunicipality} onValueChange={setSelectedMunicipality}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar municipio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los municipios</SelectItem>
                  {processedData.municipalityList.map(municipality => (
                    <SelectItem key={municipality} value={municipality}>
                      {municipality}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Distrito</label>
              <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar distrito" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los distritos</SelectItem>
                  {processedData.districtList.map(district => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Tipo de gráfico</label>
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_parties">Todos los partidos</SelectItem>
                  <SelectItem value="main_parties">Solo partidos principales</SelectItem>
                  <SelectItem value="coalitions">Solo coaliciones</SelectItem>
                  <SelectItem value="top_10">Top 10</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos principales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Flag className="h-5 w-5" />
              Resultados Electorales - México
            </span>
            <div className="flex gap-2">
              <Badge variant="outline">
                {processedData.parties.reduce((sum, p) => sum + p.votes, 0).toLocaleString()} votos totales
              </Badge>
              <Badge variant="secondary">
                {chartData.length} opciones mostradas
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="bar" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="bar">Barras</TabsTrigger>
              <TabsTrigger value="pie">Circular</TabsTrigger>
              <TabsTrigger value="area">Área</TabsTrigger>
              <TabsTrigger value="sections">Por Sección</TabsTrigger>
            </TabsList>

            <TabsContent value="bar" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Votos por Partido/Coalición</h3>
                <Button variant="outline" size="sm" onClick={() => exportChart('bar')}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
              <div className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={120}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any, name: string) => [
                        `${Number(value).toLocaleString()} votos`,
                        'Votos'
                      ]}
                      labelFormatter={(label) => `${label} - ${PARTY_NAMES[label] || label}`}
                    />
                    <Bar
                      dataKey="votes"
                      name="Votos"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="pie" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Distribución de Votos</h3>
                <Button variant="outline" size="sm" onClick={() => exportChart('pie')}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
              <div className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.slice(0, 10)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) =>
                        percentage > 3 ? `${name}: ${percentage.toFixed(1)}%` : ""
                      }
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="votes"
                    >
                      {chartData.slice(0, 10).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any, name, props) => [
                        `${Number(value).toLocaleString()} votos (${props.payload.percentage.toFixed(2)}%)`,
                        props.payload.fullName || props.payload.name
                      ]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="area" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Tendencia por Municipio</h3>
                <Button variant="outline" size="sm" onClick={() => exportChart('area')}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
              <div className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={processedData.municipalities}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={120}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any) => [`${Number(value).toLocaleString()} votos`, 'Total de Votos']}
                    />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="sections" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Participación por Sección (Primeras 20)</h3>
                <Button variant="outline" size="sm" onClick={() => exportChart('sections')}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
              <div className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={processedData.sections}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="seccion" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any) => [`${Number(value).toFixed(1)}%`, 'Participación']}
                    />
                    <Line
                      type="monotone"
                      dataKey="participation"
                      stroke="#8884d8"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Tabla de resultados detallados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            Resultados Detallados por Partido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Posición</th>
                  <th className="text-left p-3 font-medium">Partido/Coalición</th>
                  <th className="text-left p-3 font-medium">Nombre Completo</th>
                  <th className="text-right p-3 font-medium">Votos</th>
                  <th className="text-right p-3 font-medium">Porcentaje</th>
                  <th className="text-center p-3 font-medium">Tipo</th>
                  <th className="text-center p-3 font-medium">Progreso</th>
                </tr>
              </thead>
              <tbody>
                {processedData.parties.map((party, index) => (
                  <tr key={party.name} className="border-b hover:bg-muted/30">
                    <td className="p-3">
                      <Badge variant={index < 3 ? "default" : "secondary"}>
                        #{index + 1}
                      </Badge>
                    </td>
                    <td className="p-3 font-medium">{party.name}</td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {party.fullName}
                    </td>
                    <td className="p-3 text-right font-mono">
                      {party.votes.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-mono">
                      {party.percentage.toFixed(2)}%
                    </td>
                    <td className="p-3 text-center">
                      <Badge
                        variant={
                          party.type === 'coalition' ? 'default' :
                            party.type === 'null' ? 'destructive' :
                              party.type === 'non_registered' ? 'outline' : 'secondary'
                        }
                        className="text-xs"
                      >
                        {party.type === 'coalition' ? 'Coalición' :
                          party.type === 'null' ? 'Nulos' :
                            party.type === 'non_registered' ? 'No Reg.' : 'Partido'}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(party.percentage, 100)}%`,
                            backgroundColor: party.color
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Análisis de coaliciones */}
      {processedData.coalitions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Análisis de Coaliciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {processedData.coalitions.map((coalition, index) => (
                <div key={coalition.name} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{coalition.name}</h4>
                      <p className="text-sm text-muted-foreground">{coalition.fullName}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{coalition.votes.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">
                        {coalition.percentage.toFixed(2)}% del total
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="h-3 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(coalition.percentage, 100)}%`,
                        backgroundColor: coalition.color
                      }}
                    />
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

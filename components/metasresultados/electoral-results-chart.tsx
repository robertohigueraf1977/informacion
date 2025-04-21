"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ElectoralResultsChartProps {
  data: Record<string, number>
  parties: string[]
  coalitions: string[]
}

export function ElectoralResultsChart({ data, parties, coalitions }: ElectoralResultsChartProps) {
  const [chartType, setChartType] = useState<string>("bar")
  const [dataFilter, setDataFilter] = useState<string>("all")

  // Definir la paleta de colores con tema violeta
  const partyColors: Record<string, string> = {
    PAN: "#4c51bf", // indigo oscuro
    PRI: "#e53e3e", // rojo
    PRD: "#d69e2e", // amarillo
    PVEM: "#38a169", // verde
    PT: "#c53030", // rojo oscuro
    MC: "#dd6b20", // naranja
    MORENA: "#805ad5", // morado
    "PAN-PRI-PRD": "#667eea", // indigo
    PVEM_PT_MORENA: "#9f7aea", // púrpura
    PVEM_PT: "#38a169", // verde-teal
    PVEM_MORENA: "#319795", // teal
    PT_MORENA: "#b794f4", // púrpura más claro
    "PAN-PRI": "#7f9cf5", // indigo claro
    "PAN-PRD": "#a3bffa", // azul claro
    "PRI-PRD": "#fc8181", // rojo claro
    NO_REGISTRADAS: "#4a5568", // gris oscuro
    NULOS: "#2d3748", // casi negro
  }

  // Preparar datos para el gráfico
  const chartData = useMemo(() => {
    const filteredParties =
      dataFilter === "all"
        ? [...parties, "NO_REGISTRADAS", "NULOS"]
        : dataFilter === "parties"
          ? parties.filter((p) => !coalitions.includes(p))
          : dataFilter === "coalitions"
            ? coalitions
            : [...parties, "NO_REGISTRADAS", "NULOS"]

    return filteredParties
      .filter((party) => data[party] !== undefined)
      .map((party) => ({
        name: party,
        votos: data[party] || 0,
        porcentaje: Number.parseFloat((data[`${party}_porcentaje`] || 0).toFixed(2)),
      }))
      .sort((a, b) => b.votos - a.votos)
  }, [data, parties, coalitions, dataFilter])

  // Datos para el gráfico de pastel
  const pieData = useMemo(() => {
    return chartData.map((item) => ({
      name: item.name,
      value: chartType === "votes" ? item.votos : item.porcentaje,
    }))
  }, [chartData, chartType])

  return (
    <div className="space-y-6">
      <Card className="border-accent-soft">
        <CardHeader className="flex flex-row items-center justify-between bg-secondary-soft rounded-t-lg">
          <div>
            <CardTitle className="text-primary">Resultados Electorales</CardTitle>
            <CardDescription>Visualización de votos por partido/coalición</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={dataFilter} onValueChange={setDataFilter}>
              <SelectTrigger className="w-[180px] border-accent-soft">
                <SelectValue placeholder="Filtrar datos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="parties">Solo Partidos</SelectItem>
                <SelectItem value="coalitions">Solo Coaliciones</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={chartType} onValueChange={setChartType} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 bg-secondary">
              <TabsTrigger
                value="bar"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Barras
              </TabsTrigger>
              <TabsTrigger
                value="pie"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Pastel
              </TabsTrigger>
              <TabsTrigger
                value="percentage"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Porcentajes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="bar" className="h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9d8fd" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} interval={0} tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip
                    formatter={(value: any) => [`${value.toLocaleString()} votos`, "Votos"]}
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      borderRadius: "6px",
                      border: "1px solid #e9d8fd",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="votos" name="Votos" radius={[4, 4, 0, 0]} barSize={30}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={partyColors[entry.name] || "#9f7aea"} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="pie" className="h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={180}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={partyColors[entry.name] || "#9f7aea"} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`${value.toLocaleString()} votos`, "Votos"]}
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      borderRadius: "6px",
                      border: "1px solid #e9d8fd",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="percentage" className="h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9d8fd" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} interval={0} tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip
                    formatter={(value: any) => [`${value.toFixed(2)}%`, "Porcentaje"]}
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      borderRadius: "6px",
                      border: "1px solid #e9d8fd",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="porcentaje" name="Porcentaje" radius={[4, 4, 0, 0]} barSize={30}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={partyColors[entry.name] || "#9f7aea"} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

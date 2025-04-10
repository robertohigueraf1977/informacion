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

  // Definir la paleta de colores
  const partyColors: Record<string, string> = {
    PAN: "#1e40af", // azul oscuro
    PRI: "#dc2626", // rojo
    PRD: "#f59e0b", // amarillo
    PVEM: "#15803d", // verde
    PT: "#b91c1c", // rojo oscuro
    MC: "#ea580c", // naranja
    MORENA: "#7e22ce", // morado
    "PAN-PRI-PRD": "#6366f1", // indigo
    PVEM_PT_MORENA: "#a855f7", // púrpura
    PVEM_PT: "#059669", // verde-teal
    PVEM_MORENA: "#0d9488", // teal
    PT_MORENA: "#9333ea", // púrpura más claro
    "PAN-PRI": "#818cf8", // indigo claro
    "PAN-PRD": "#93c5fd", // azul claro
    "PRI-PRD": "#fca5a5", // rojo claro
    NO_REGISTRADAS: "#374151", // gris oscuro
    NULOS: "#1f2937", // casi negro
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Resultados Electorales</CardTitle>
            <CardDescription>Visualización de votos por partido/coalición</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={dataFilter} onValueChange={setDataFilter}>
              <SelectTrigger className="w-[180px]">
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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="bar">Barras</TabsTrigger>
              <TabsTrigger value="pie">Pastel</TabsTrigger>
              <TabsTrigger value="percentage">Porcentajes</TabsTrigger>
              <TabsTrigger value="blocks">Bloques</TabsTrigger>
            </TabsList>

            <TabsContent value="bar" className="h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} interval={0} tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip
                    formatter={(value: any) => [`${value.toLocaleString()} votos`, "Votos"]}
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      borderRadius: "6px",
                      border: "1px solid #e2e8f0",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="votos" name="Votos" radius={[4, 4, 0, 0]} barSize={30}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={partyColors[entry.name] || "#6b7280"} fillOpacity={0.8} />
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
                      <Cell key={`cell-${index}`} fill={partyColors[entry.name] || "#6b7280"} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`${value.toLocaleString()} votos`, "Votos"]}
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      borderRadius: "6px",
                      border: "1px solid #e2e8f0",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="percentage" className="h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} interval={0} tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip
                    formatter={(value: any) => [`${value.toFixed(2)}%`, "Porcentaje"]}
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      borderRadius: "6px",
                      border: "1px solid #e2e8f0",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="porcentaje" name="Porcentaje" radius={[4, 4, 0, 0]} barSize={30}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={partyColors[entry.name] || "#6b7280"} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="blocks" className="h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    {
                      name: "Izquierda",
                      votos: data.bloque_izquierda || 0,
                      porcentaje: data.bloque_izquierda_porcentaje || 0,
                    },
                    {
                      name: "Derecha",
                      votos: data.bloque_derecha || 0,
                      porcentaje: data.bloque_derecha_porcentaje || 0,
                    },
                    { name: "Centro", votos: data.bloque_centro || 0, porcentaje: data.bloque_centro_porcentaje || 0 },
                    { name: "Nulos", votos: data.NULOS || 0, porcentaje: data.NULOS_porcentaje || 0 },
                    {
                      name: "No Registrados",
                      votos: data.NO_REGISTRADAS || 0,
                      porcentaje: data.NO_REGISTRADAS_porcentaje || 0,
                    },
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: any) => [`${value.toLocaleString()} votos`, "Votos"]}
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      borderRadius: "6px",
                      border: "1px solid #e2e8f0",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="votos" name="Votos" radius={[4, 4, 0, 0]} barSize={60}>
                    <Cell fill="#7e22ce" /> {/* Izquierda - morado */}
                    <Cell fill="#1e40af" /> {/* Derecha - azul */}
                    <Cell fill="#ea580c" /> {/* Centro - naranja */}
                    <Cell fill="#1f2937" /> {/* Nulos - casi negro */}
                    <Cell fill="#374151" /> {/* No Registrados - gris oscuro */}
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

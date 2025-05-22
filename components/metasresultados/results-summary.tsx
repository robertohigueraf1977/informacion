"use client"

import { AnimatedCounter } from "@/components/ui/animated-counter"
import { CardSpotlight } from "@/components/ui/card-spotlight"
import { StatCard } from "@/components/ui/stat-card"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"
import { ClipboardList, UserCheck, Vote, VoteIcon } from "lucide-react"

interface ResultsSummaryProps {
  data: Record<string, number>
}

export function ResultsSummary({ data }: ResultsSummaryProps) {
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
    NO_REGISTRADAS: "#4a5568", // gris oscuro
    NULOS: "#2d3748", // casi negro
  }

  const getPartyColor = (party: string): string => {
    return partyColors[party] || "#a78bfa" // Default to violet if not found
  }

  // Ordenar partidos y coaliciones por número de votos (de mayor a menor)
  const sortedResults = Object.entries(data)
    .filter(
      ([key, value]) =>
        !key.includes("porcentaje") &&
        key !== "total_votos" &&
        key !== "total_secciones" &&
        key !== "total_lista_nominal" &&
        key !== "participacion" &&
        !key.includes("bloque_") &&
        key !== "NULOS" &&
        key !== "NO_REGISTRADAS",
    )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8) // Mostrar solo los primeros

  // Preparar datos para el gráfico
  const chartData = sortedResults.map(([party, votes]) => ({
    name: party,
    votos: votes,
    porcentaje: data[`${party}_porcentaje`] || 0,
  }))

  return (
    <div className="space-y-6 animate-in fade-in-50">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <CardSpotlight containerClassName="h-full">
          <StatCard
            title="Total de Votos"
            value={
              <AnimatedCounter
                from={0}
                to={data.total_votos || 0}
                formatValue={(val) => val.toLocaleString()}
                className="text-2xl font-bold"
              />
            }
            description={`De ${data.total_lista_nominal?.toLocaleString() || 0} en lista nominal`}
            icon={<Vote className="h-4 w-4" />}
            className="border-0 h-full"
          />
        </CardSpotlight>

        <CardSpotlight containerClassName="h-full">
          <StatCard
            title="Participación"
            value={`${data.participacion?.toFixed(1) || 0}%`}
            icon={<UserCheck className="h-4 w-4" />}
            className="border-0 h-full"
            descriptionElement={
              <div className="mt-2">
                <Progress
                  value={data.participacion || 0}
                  className="h-2 bg-secondary"
                  indicatorClassName="bg-primary"
                />
              </div>
            }
          />
        </CardSpotlight>

        <CardSpotlight containerClassName="h-full">
          <StatCard
            title="Secciones"
            value={
              <AnimatedCounter
                from={0}
                to={data.total_secciones || 0}
                formatValue={(val) => val.toLocaleString()}
                className="text-2xl font-bold"
              />
            }
            description="Secciones electorales analizadas"
            icon={<ClipboardList className="h-4 w-4" />}
            className="border-0 h-full"
          />
        </CardSpotlight>

        <CardSpotlight containerClassName="h-full">
          <StatCard
            title="Votos Nulos"
            value={
              <AnimatedCounter
                from={0}
                to={data.NULOS || 0}
                formatValue={(val) => val.toLocaleString()}
                className="text-2xl font-bold"
              />
            }
            description={`${(data.NULOS_porcentaje || 0).toFixed(2)}% del total de votos`}
            icon={<VoteIcon className="h-4 w-4" />}
            className="border-0 h-full"
          />
        </CardSpotlight>
      </div>

      <CardSpotlight containerClassName="w-full">
        <Tabs defaultValue="bars" className="w-full">
          <CardHeader className="bg-secondary-soft rounded-t-lg pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-primary">Resultados por Partido/Coalición</CardTitle>
              <TabsList className="bg-background">
                <TabsTrigger
                  value="bars"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Gráfico
                </TabsTrigger>
                <TabsTrigger
                  value="table"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Tabla
                </TabsTrigger>
              </TabsList>
            </div>
          </CardHeader>
          <CardContent>
            <TabsContent value="bars" className="mt-0">
              <div className="h-[400px] pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e9d8fd" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} interval={0} />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any, name: string) => {
                        // Asegurarse de que value sea un número antes de llamar a toFixed()
                        if (name === "votos") {
                          return [`${typeof value === "number" ? value.toLocaleString() : value} votos`, "Votos"]
                        } else {
                          // Para porcentaje, asegurarse de que sea un número
                          const numValue = typeof value === "number" ? value : 0
                          return [`${numValue.toFixed(2)}%`, "Porcentaje"]
                        }
                      }}
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        borderRadius: "6px",
                        border: "1px solid #e9d8fd",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="votos" name="Votos" radius={[4, 4, 0, 0]} barSize={36} animationDuration={1500}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getPartyColor(entry.name)} fillOpacity={0.8} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="table" className="mt-0">
              <div className="space-y-6 pt-4">
                {sortedResults.map(([party, votes]) => {
                  const percentage = data[`${party}_porcentaje`] || 0
                  const color = getPartyColor(party)
                  return (
                    <div key={party} className="space-y-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                          <span className="font-medium">{party}</span>
                        </div>
                        <div className="font-medium">{votes.toLocaleString()} votos</div>
                      </div>
                      <div className="relative pt-1">
                        <div className="flex items-center justify-between mb-1">
                          <div></div>
                          <div className="text-sm text-muted-foreground">{percentage.toFixed(2)}%</div>
                        </div>
                        <div className="overflow-hidden h-2 text-xs flex rounded bg-secondary">
                          <div
                            style={{ width: `${percentage}%`, backgroundColor: color }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500"
                          ></div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </CardSpotlight>
    </div>
  )
}

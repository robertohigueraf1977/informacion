"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface ResultsSummaryProps {
  data: Record<string, number>
}

export function ResultsSummary({ data }: ResultsSummaryProps) {
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
    NO_REGISTRADAS: "#374151", // gris oscuro
    NULOS: "#1f2937", // casi negro
  }

  const getPartyColor = (party: string): string => {
    return partyColors[party] || "#9ca3af" // Default to gray if not found
  }

  // Ordenar partidos y coaliciones por número de votos (de mayor a menor)
  const sortedResults = Object.entries(data)
    .filter(
      ([key, value]) =>
        !key.includes("porcentaje") &&
        key !== "total_votos" &&
        key !== "total_secciones" &&
        key !== "total_lista_nominal" &&
        key !== "participacion",
    )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10) // Mostrar solo los 10 primeros

  // Preparar datos para el gráfico
  const chartData = sortedResults.map(([party, votes]) => ({
    name: party,
    votos: votes,
    porcentaje: data[`${party}_porcentaje`] || 0,
  }))

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Votos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.total_votos?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              De {data.total_lista_nominal?.toLocaleString() || 0} en lista nominal
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.participacion?.toFixed(2) || 0}%</div>
            <Progress value={data.participacion || 0} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Secciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.total_secciones?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Secciones electorales analizadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Votos Nulos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.NULOS?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              {data.NULOS_porcentaje?.toFixed(2) || 0}% del total de votos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add block analysis section */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis por Bloques</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-24 font-medium">Izquierda</div>
              <div className="flex-1 mx-4">
                <Progress
                  value={data.bloque_izquierda_porcentaje || 0}
                  className="h-3"
                  indicatorClassName="bg-[#7e22ce]"
                />
              </div>
              <div className="w-24 text-right font-medium">{(data.bloque_izquierda || 0).toLocaleString()}</div>
              <div className="w-20 text-right text-muted-foreground">
                {(data.bloque_izquierda_porcentaje || 0).toFixed(2)}%
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-24 font-medium">Derecha</div>
              <div className="flex-1 mx-4">
                <Progress
                  value={data.bloque_derecha_porcentaje || 0}
                  className="h-3"
                  indicatorClassName="bg-[#1e40af]"
                />
              </div>
              <div className="w-24 text-right font-medium">{(data.bloque_derecha || 0).toLocaleString()}</div>
              <div className="w-20 text-right text-muted-foreground">
                {(data.bloque_derecha_porcentaje || 0).toFixed(2)}%
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-24 font-medium">Centro</div>
              <div className="flex-1 mx-4">
                <Progress
                  value={data.bloque_centro_porcentaje || 0}
                  className="h-3"
                  indicatorClassName="bg-[#ea580c]"
                />
              </div>
              <div className="w-24 text-right font-medium">{(data.bloque_centro || 0).toLocaleString()}</div>
              <div className="w-20 text-right text-muted-foreground">
                {(data.bloque_centro_porcentaje || 0).toFixed(2)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="bars" className="space-y-4">
        <TabsList>
          <TabsTrigger value="bars">Gráfico</TabsTrigger>
          <TabsTrigger value="table">Tabla</TabsTrigger>
        </TabsList>

        <TabsContent value="bars">
          <Card>
            <CardHeader>
              <CardTitle>Resultados por Partido/Coalición</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} interval={0} />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any, name: string) => [
                        name === "votos" ? `${value.toLocaleString()} votos` : `${value.toFixed(2)}%`,
                        name === "votos" ? "Votos" : "Porcentaje",
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="votos" name="Votos" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="table">
          <Card>
            <CardHeader>
              <CardTitle>Resultados por Partido/Coalición</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sortedResults.map(([party, votes]) => {
                  const percentage = data[`${party}_porcentaje`] || 0
                  return (
                    <div key={party} className="flex items-center">
                      <div className="w-16 md:w-24 font-medium">{party}</div>
                      <div className="flex-1 mx-4">
                        <Progress
                          value={percentage}
                          className="h-2"
                          indicatorClassName={`bg-[${getPartyColor(party)}]`}
                        />
                      </div>
                      <div className="w-20 text-right font-medium">{votes.toLocaleString()}</div>
                      <div className="w-16 text-right text-muted-foreground">{percentage.toFixed(2)}%</div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

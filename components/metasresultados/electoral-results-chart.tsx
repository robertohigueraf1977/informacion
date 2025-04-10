"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface ElectoralResultsChartProps {
  data: Record<string, number>
  parties: string[]
  coalitions: string[]
}

export function ElectoralResultsChart({ data, parties, coalitions }: ElectoralResultsChartProps) {
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

  // Preparar datos para el gráfico de votos totales
  const votesChartData = useMemo(() => {
    const chartData = []

    // Agregar partidos
    parties.forEach((party) => {
      if (data[party] !== undefined) {
        chartData.push({
          name: party,
          votos: data[party] || 0,
        })
      }
    })

    // Agregar coaliciones
    coalitions.forEach((coalition) => {
      if (data[coalition] !== undefined) {
        chartData.push({
          name: coalition,
          votos: data[coalition] || 0,
        })
      }
    })

    // Agregar no registrados y nulos
    if (data["NO_REGISTRADAS"] !== undefined) {
      chartData.push({
        name: "No Registrados",
        votos: data["NO_REGISTRADAS"] || 0,
      })
    }

    if (data["NULOS"] !== undefined) {
      chartData.push({
        name: "Nulos",
        votos: data["NULOS"] || 0,
      })
    }

    return chartData
  }, [data, parties, coalitions])

  // Preparar datos para el gráfico de porcentajes
  const percentageChartData = useMemo(() => {
    const chartData = []

    // Agregar partidos
    parties.forEach((party) => {
      const key = `${party}_porcentaje`
      if (data[key] !== undefined) {
        chartData.push({
          name: party,
          porcentaje: Number.parseFloat(data[key].toFixed(2)) || 0,
        })
      }
    })

    // Agregar coaliciones
    coalitions.forEach((coalition) => {
      const key = `${coalition}_porcentaje`
      if (data[key] !== undefined) {
        chartData.push({
          name: coalition,
          porcentaje: Number.parseFloat(data[key].toFixed(2)) || 0,
        })
      }
    })

    // Agregar no registrados y nulos
    if (data["NO_REGISTRADAS_porcentaje"] !== undefined) {
      chartData.push({
        name: "No Registrados",
        porcentaje: Number.parseFloat(data["NO_REGISTRADAS_porcentaje"].toFixed(2)) || 0,
      })
    }

    if (data["NULOS_porcentaje"] !== undefined) {
      chartData.push({
        name: "Nulos",
        porcentaje: Number.parseFloat(data["NULOS_porcentaje"].toFixed(2)) || 0,
      })
    }

    return chartData
  }, [data, parties, coalitions])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Votos Totales por Partido/Coalición</CardTitle>
          <CardDescription>Número total de votos recibidos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={votesChartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 70,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                <YAxis />
                <Tooltip formatter={(value) => [`${value.toLocaleString()} votos`, "Votos"]} />
                <Legend />
                {votesChartData.map((entry) => (
                  <Bar
                    key={`votos-${entry.name}`}
                    dataKey="votos"
                    name={entry.name}
                    fill={partyColors[entry.name] || "#6b7280"} // Usar color del partido
                    radius={[4, 4, 0, 0]}
                    fillOpacity={0.8}
                    barSize={30}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Porcentaje de Votos</CardTitle>
          <CardDescription>Porcentaje del total de votos recibidos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={percentageChartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 70,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                <YAxis />
                <Tooltip formatter={(value) => [`${value.toFixed(2)}%`, "Porcentaje"]} />
                <Legend />
                {percentageChartData.map((entry) => (
                  <Bar
                    key={`porcentaje-${entry.name}`}
                    dataKey="porcentaje"
                    name={entry.name}
                    fill={partyColors[entry.name] || "#6b7280"} // Usar color del partido
                    radius={[4, 4, 0, 0]}
                    fillOpacity={0.8}
                    barSize={30}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "@/lib/utils"

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

  return (
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
          <p className="text-xs text-muted-foreground">{data.NULOS_porcentaje?.toFixed(2) || 0}% del total de votos</p>
        </CardContent>
      </Card>

      <Card className="col-span-full">
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
                      style={{ "--progress-background": getPartyColor(party) } as React.CSSProperties}
                    >
                      <ProgressPrimitive.Indicator
                        className={cn("h-full w-full flex-1 transition-all", `bg-[${getPartyColor(party)}]`)}
                      />
                    </Progress>
                  </div>
                  <div className="w-20 text-right font-medium">{votes.toLocaleString()}</div>
                  <div className="w-16 text-right text-muted-foreground">{percentage.toFixed(2)}%</div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

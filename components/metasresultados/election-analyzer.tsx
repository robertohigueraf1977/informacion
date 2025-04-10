"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ElectoralResultsChart } from "@/components/metasresultados/electoral-results-chart"
import { ResultsSummary } from "@/components/metasresultados/results-summary"
import { CoalitionBuilder } from "@/components/metasresultados/coalition-builder"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ElectionAnalyzerProps {
  data: any[]
}

export function ElectionAnalyzer({ data }: ElectionAnalyzerProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [parties, setParties] = useState<string[]>([])
  const [coalitions, setCoalitions] = useState<string[]>([])
  const [results, setResults] = useState<Record<string, any>>({})

  // Update the data processing to handle the specific schema
  useEffect(() => {
    if (!data || data.length === 0) {
      setError("No hay datos disponibles para analizar")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Extraer partidos y coaliciones de las columnas
      const firstRow = data[0]
      const columns = Object.keys(firstRow)

      const extractedParties = columns.filter(
        (header) =>
          header !== "SECCION" &&
          header !== "DISTRITO" &&
          header !== "MUNICIPIO" &&
          header !== "LOCALIDAD" &&
          header !== "LISTA_NOMINAL",
      )

      // Separar partidos individuales y coaliciones
      const individualParties = extractedParties.filter(
        (party) => !party.includes("-") && !party.includes("_") && party !== "NO_REGISTRADAS" && party !== "NULOS",
      )

      const coalitionParties = extractedParties.filter(
        (party) => (party.includes("-") || party.includes("_")) && party !== "NO_REGISTRADAS" && party !== "NULOS",
      )

      setParties(extractedParties)
      setCoalitions(coalitionParties)

      // Calcular totales y porcentajes
      const totals: Record<string, number> = {}
      let totalVotos = 0
      let totalListaNominal = 0

      data.forEach((row) => {
        extractedParties.forEach((party) => {
          const votes = Number(row[party])
          if (!isNaN(votes)) {
            totals[party] = (totals[party] || 0) + votes
            totalVotos += votes
          }
        })

        const listaNominal = Number(row.LISTA_NOMINAL)
        if (!isNaN(listaNominal)) {
          totalListaNominal += listaNominal
        }
      })

      // Calcular porcentajes
      const calculatedResults: Record<string, number> = {
        total_votos: totalVotos,
        total_lista_nominal: totalListaNominal,
        participacion: totalListaNominal > 0 ? (totalVotos / totalListaNominal) * 100 : 0,
        total_secciones: data.length,
      }

      extractedParties.forEach((party) => {
        calculatedResults[party] = totals[party] || 0
        calculatedResults[`${party}_porcentaje`] = totalVotos > 0 ? ((totals[party] || 0) / totalVotos) * 100 : 0
      })

      // Calcular bloques principales (izquierda vs derecha)
      const izquierdaTotal =
        (totals["MORENA"] || 0) +
        (totals["PT"] || 0) +
        (totals["PVEM"] || 0) +
        (totals["PVEM_PT_MORENA"] || 0) +
        (totals["PVEM_MORENA"] || 0) +
        (totals["PT_MORENA"] || 0)

      const derechaTotal =
        (totals["PAN"] || 0) +
        (totals["PRI"] || 0) +
        (totals["PRD"] || 0) +
        (totals["PAN-PRI-PRD"] || 0) +
        (totals["PAN-PRI"] || 0) +
        (totals["PAN-PRD"] || 0) +
        (totals["PRI-PRD"] || 0)

      const centroTotal = totals["MC"] || 0

      calculatedResults["bloque_izquierda"] = izquierdaTotal
      calculatedResults["bloque_derecha"] = derechaTotal
      calculatedResults["bloque_centro"] = centroTotal
      calculatedResults["bloque_izquierda_porcentaje"] = totalVotos > 0 ? (izquierdaTotal / totalVotos) * 100 : 0
      calculatedResults["bloque_derecha_porcentaje"] = totalVotos > 0 ? (derechaTotal / totalVotos) * 100 : 0
      calculatedResults["bloque_centro_porcentaje"] = totalVotos > 0 ? (centroTotal / totalVotos) * 100 : 0

      setResults(calculatedResults)
      setLoading(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido al procesar los datos")
      setLoading(false)
    }
  }, [data])

  const handleCoalitionResultsChange = useCallback((coalitionResults: Record<string, any>) => {
    setResults((prevResults) => ({ ...prevResults, ...coalitionResults }))
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cargando datos...</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px]" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList>
          <TabsTrigger value="summary">Resumen</TabsTrigger>
          <TabsTrigger value="coalition">Coaliciones</TabsTrigger>
          <TabsTrigger value="charts">Gráficos</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <ResultsSummary data={results} />
        </TabsContent>

        <TabsContent value="coalition">
          <CoalitionBuilder data={data} parties={parties} onCoalitionResultsChange={handleCoalitionResultsChange} />
        </TabsContent>

        <TabsContent value="charts">
          <ElectoralResultsChart data={results} parties={parties} coalitions={coalitions} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

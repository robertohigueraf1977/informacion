"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ElectoralResultsChart } from "@/components/metasresultados/electoral-results-chart"
import { ResultsSummary } from "@/components/metasresultados/results-summary"
import { CoalitionBuilder } from "@/components/metasresultados/coalition-builder"

interface ElectionAnalyzerProps {
  csvUrl: string
}

export function ElectionAnalyzer({ csvUrl }: ElectionAnalyzerProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [parties, setParties] = useState<string[]>([])
  const [coalitions, setCoalitions] = useState<string[]>([])
  const [results, setResults] = useState<Record<string, any>>({})

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(csvUrl)
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`)
      }
      const text = await response.text()

      // Parse CSV text
      const lines = text.split("\n")
      const headers = lines[0].split("\t")
      const parsedData = lines.slice(1).map((line) => {
        const values = line.split("\t")
        const row: Record<string, string> = {}
        headers.forEach((header, index) => {
          row[header] = values[index]
        })
        return row
      })

      setData(parsedData)

      // Extract parties and coalitions
      const extractedParties = headers.filter(
        (header) =>
          header !== "SECCION" &&
          header !== "DISTRITO" &&
          header !== "MUNICIPIO" &&
          header !== "LOCALIDAD" &&
          header !== "LISTA_NOMINAL",
      )
      setParties(extractedParties)
      setCoalitions(extractedParties.filter((party) => party.includes("-")))

      console.log("Data loaded successfully")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error")
      console.error("Error loading data:", e)
    } finally {
      setLoading(false)
    }
  }, [csvUrl])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    if (data.length > 0) {
      // Calcular totales y porcentajes
      const totals: Record<string, number> = {}
      let totalVotos = 0
      let totalListaNominal = 0

      data.forEach((row) => {
        parties.forEach((party) => {
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

      parties.forEach((party) => {
        calculatedResults[party] = totals[party] || 0
        calculatedResults[`${party}_porcentaje`] = totalVotos > 0 ? ((totals[party] || 0) / totalVotos) * 100 : 0
      })

      setResults(calculatedResults)
    }
  }, [data, parties])

  const handleCoalitionResultsChange = (coalitionResults: Record<string, any>) => {
    setResults((prevResults) => ({ ...prevResults, ...coalitionResults }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Análisis Electoral</h2>
        <p className="text-muted-foreground">Analiza los resultados electorales y crea escenarios de coalición</p>
      </div>

      {loading ? (
        <Card>
          <CardHeader>
            <CardTitle>Cargando datos...</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[400px]" />
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <ResultsSummary data={results} />
          <CoalitionBuilder data={data} parties={parties} onCoalitionResultsChange={handleCoalitionResultsChange} />
          <ElectoralResultsChart data={results} parties={parties} coalitions={coalitions} />
        </>
      )}
    </div>
  )
}

"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calculator, Target, TrendingUp, Users } from "lucide-react"

interface CoalitionBuilderProps {
  data: any[]
  parties: string[]
  onCoalitionResultsChange: (results: Record<string, any>) => void
}

export function CoalitionBuilder({ data, parties, onCoalitionResultsChange }: CoalitionBuilderProps) {
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

  const getPartyColor = (party: string) => {
    return partyColors[party] || "#ccc" // Default color if not found
  }

  // Estado para los partidos seleccionados en la coalición
  const [selectedParties, setSelectedParties] = useState<string[]>(["MORENA", "PT", "PVEM"])

  // Estado para el porcentaje objetivo (del 10% al 100%)
  const [targetPercentage, setTargetPercentage] = useState(70)

  // Estado para los resultados calculados
  const [results, setResults] = useState<{
    totalVotes: number
    coalitionVotes: number
    targetVotes: number
    sectionResults: Array<{
      section: string
      totalVotes: number
      coalitionVotes: number
      targetVotes: number
      percentage: number
      targetPercentage: number
    }>
  }>({
    totalVotes: 0,
    coalitionVotes: 0,
    targetVotes: 0,
    sectionResults: [],
  })

  // Calcular resultados cuando cambian los partidos seleccionados o el porcentaje objetivo
  useEffect(() => {
    if (!data || data.length === 0) return

    // Obtener todas las secciones únicas
    const sections = [...new Set(data.map((row) => row.SECCION))]

    let totalVotesAll = 0
    let coalitionVotesAll = 0
    const sectionResults: Array<{
      section: string
      totalVotes: number
      coalitionVotes: number
      targetVotes: number
      percentage: number
      targetPercentage: number
    }> = []

    // Calcular votos por sección
    sections.forEach((section) => {
      const sectionData = data.filter((row) => row.SECCION === section)
      let sectionTotalVotes = 0
      let sectionCoalitionVotes = 0

      // Calcular total de votos por sección
      sectionData.forEach((row) => {
        parties.forEach((party) => {
          if (row[party] && row[party] !== "-" && !isNaN(Number(row[party]))) {
            const votes = Number(row[party])
            sectionTotalVotes += votes

            // Sumar votos de la coalición
            if (selectedParties.includes(party)) {
              sectionCoalitionVotes += votes
            }
          }
        })

        // Incluir votos no registrados y nulos en el total
        if (row["NO_REGISTRADAS"] && row["NO_REGISTRADAS"] !== "-" && !isNaN(Number(row["NO_REGISTRADAS"]))) {
          sectionTotalVotes += Number(row["NO_REGISTRADAS"])
        }

        if (row["NULOS"] && row["NULOS"] !== "-" && !isNaN(Number(row["NULOS"]))) {
          sectionTotalVotes += Number(row["NULOS"])
        }
      })

      // Calcular el objetivo para esta sección
      const sectionTargetVotes = Math.round(sectionCoalitionVotes * (targetPercentage / 100))

      // Agregar a los totales
      totalVotesAll += sectionTotalVotes
      coalitionVotesAll += sectionCoalitionVotes

      // Guardar resultados de la sección
      sectionResults.push({
        section,
        totalVotes: sectionTotalVotes,
        coalitionVotes: sectionCoalitionVotes,
        targetVotes: sectionTargetVotes,
        percentage: sectionTotalVotes > 0 ? (sectionCoalitionVotes / sectionTotalVotes) * 100 : 0,
        targetPercentage: sectionTotalVotes > 0 ? (sectionTargetVotes / sectionTotalVotes) * 100 : 0,
      })
    })

    // Calcular el objetivo total
    const targetVotesAll = Math.round(coalitionVotesAll * (targetPercentage / 100))

    // Ordenar secciones por número de votos de la coalición (de mayor a menor)
    sectionResults.sort((a, b) => b.coalitionVotes - a.coalitionVotes)

    // Actualizar resultados
    const newResults = {
      totalVotes: totalVotesAll,
      coalitionVotes: coalitionVotesAll,
      targetVotes: targetVotesAll,
      sectionResults,
    }

    setResults(newResults)
    onCoalitionResultsChange(newResults)
  }, [data, parties, selectedParties, targetPercentage, onCoalitionResultsChange])

  // Manejar cambios en la selección de partidos
  const handlePartySelection = useCallback((party: string, checked: boolean) => {
    setSelectedParties((prev) => {
      if (checked) {
        return [...prev, party]
      } else {
        return prev.filter((p) => p !== party)
      }
    })
  }, [])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Configuración de la coalición */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Configuración de Coalición</CardTitle>
            <CardDescription>Selecciona los partidos de la coalición y establece el objetivo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="block mb-2">Partidos en la Coalición</Label>
              <div className="grid grid-cols-1 gap-2">
                {parties.map((party, index) => (
                  <div key={`party-${party}-${index}`} className="flex items-center space-x-2">
                    <Checkbox
                      id={`select-${party}`}
                      checked={selectedParties.includes(party)}
                      onCheckedChange={(checked) => handlePartySelection(party, checked === true)}
                    />
                    <Label htmlFor={`select-${party}`} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getPartyColor(party) }}></div>
                      {party}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Objetivo (% de votos a alcanzar)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[targetPercentage]}
                  min={10}
                  max={100}
                  step={1}
                  onValueChange={(value) => setTargetPercentage(value[0])}
                  className="flex-1"
                />
                <span className="font-bold text-lg w-12 text-right">{targetPercentage}%</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Define qué porcentaje de los votos actuales de la coalición quieres establecer como objetivo.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Resumen de resultados */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Resumen de Resultados</CardTitle>
            <CardDescription>Análisis de votos y objetivos para la coalición</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">Votos Totales</h3>
                </div>
                <p className="text-2xl font-bold">{results.totalVotes.toLocaleString()}</p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">Votos Coalición</h3>
                </div>
                <p className="text-2xl font-bold">{results.coalitionVotes.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">
                  {results.totalVotes > 0
                    ? `${((results.coalitionVotes / results.totalVotes) * 100).toFixed(1)}% del total`
                    : "0% del total"}
                </p>
              </div>

              <div className="bg-primary/10 p-4 rounded-lg border-2 border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">Objetivo ({targetPercentage}%)</h3>
                </div>
                <p className="text-2xl font-bold">{results.targetVotes.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">
                  {results.totalVotes > 0
                    ? `${((results.targetVotes / results.totalVotes) * 100).toFixed(1)}% del total`
                    : "0% del total"}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Progreso hacia el objetivo</h3>
              <Progress value={targetPercentage} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>10%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de resultados por sección */}
      <Card>
        <CardHeader>
          <CardTitle>Resultados por Sección</CardTitle>
          <CardDescription>Detalle de votos y objetivos por sección electoral</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sección</TableHead>
                  <TableHead className="text-right">Votos Totales</TableHead>
                  <TableHead className="text-right">Votos Coalición</TableHead>
                  <TableHead className="text-right">% Actual</TableHead>
                  <TableHead className="text-right">Objetivo ({targetPercentage}%)</TableHead>
                  <TableHead className="text-right">% del Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.sectionResults.slice(0, 20).map((section, index) => (
                  <TableRow key={`section-${section.section}-${index}`}>
                    <TableCell className="font-medium">{section.section}</TableCell>
                    <TableCell className="text-right">{section.totalVotes.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{section.coalitionVotes.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{section.percentage.toFixed(1)}%</TableCell>
                    <TableCell className="text-right">{section.targetVotes.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{section.targetPercentage.toFixed(1)}%</TableCell>
                  </TableRow>
                ))}
                {results.sectionResults.length > 20 && (
                  <TableRow key="pagination-summary">
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Mostrando 20 de {results.sectionResults.length} secciones
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            Las secciones están ordenadas por número de votos de la coalición (de mayor a menor).
          </p>
          <Button variant="outline" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Exportar Análisis
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

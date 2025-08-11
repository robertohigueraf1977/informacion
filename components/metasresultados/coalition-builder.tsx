"use client"

import { useState, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, Calculator, Users, TrendingUp, Award } from 'lucide-react'
import { StatCard } from "@/components/ui/stat-card"
import { AnimatedCounter } from "@/components/ui/animated-counter"

interface Coalition {
  id: string
  name: string
  parties: string[]
  color: string
}

interface CoalitionBuilderProps {
  data: any[]
  parties: string[]
  onCoalitionResultsChange: (results: Record<string, any>) => void
}

export function CoalitionBuilder({ data, parties, onCoalitionResultsChange }: CoalitionBuilderProps) {
  const [coalitions, setCoalitions] = useState<Coalition[]>([])
  const [newCoalitionName, setNewCoalitionName] = useState("")
  const [selectedParties, setSelectedParties] = useState<string[]>([])
  const [selectedColor, setSelectedColor] = useState("#3B82F6")

  const availableColors = [
    "#3B82F6", "#EF4444", "#10B981", "#F59E0B",
    "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16"
  ]

  // Calcular resultados de coaliciones
  const coalitionResults = useMemo(() => {
    if (!data || data.length === 0 || coalitions.length === 0) return {}

    const results: Record<string, any> = {}

    coalitions.forEach(coalition => {
      let totalVotes = 0
      let sectionsWon = 0

      // Calcular votos por sección para esta coalición
      data.forEach(row => {
        let coalitionVotes = 0
        coalition.parties.forEach(party => {
          coalitionVotes += Number(row[party]) || 0
        })

        totalVotes += coalitionVotes

        // Determinar si esta coalición ganó en esta sección
        let maxVotes = 0
        let winner = ""

        // Comparar con otras coaliciones
        coalitions.forEach(otherCoalition => {
          let otherVotes = 0
          otherCoalition.parties.forEach(party => {
            otherVotes += Number(row[party]) || 0
          })
          if (otherVotes > maxVotes) {
            maxVotes = otherVotes
            winner = otherCoalition.id
          }
        })

        // Comparar con partidos individuales no incluidos en coaliciones
        const usedParties = new Set(coalitions.flatMap(c => c.parties))
        parties.forEach(party => {
          if (!usedParties.has(party)) {
            const partyVotes = Number(row[party]) || 0
            if (partyVotes > maxVotes) {
              maxVotes = partyVotes
              winner = party
            }
          }
        })

        if (winner === coalition.id && coalitionVotes === maxVotes) {
          sectionsWon++
        }
      })

      results[`coalition_${coalition.id}_votes`] = totalVotes
      results[`coalition_${coalition.id}_sections_won`] = sectionsWon
      results[`coalition_${coalition.id}_win_percentage`] = data.length > 0 ? (sectionsWon / data.length) * 100 : 0
    })

    return results
  }, [data, coalitions, parties])

  // Actualizar resultados cuando cambien
  useMemo(() => {
    onCoalitionResultsChange(coalitionResults)
  }, [coalitionResults, onCoalitionResultsChange])

  const addCoalition = useCallback(() => {
    if (!newCoalitionName.trim() || selectedParties.length === 0) return

    const newCoalition: Coalition = {
      id: Date.now().toString(),
      name: newCoalitionName.trim(),
      parties: [...selectedParties],
      color: selectedColor
    }

    setCoalitions(prev => [...prev, newCoalition])
    setNewCoalitionName("")
    setSelectedParties([])
    setSelectedColor(availableColors[coalitions.length % availableColors.length])
  }, [newCoalitionName, selectedParties, selectedColor, coalitions.length])

  const removeCoalition = useCallback((coalitionId: string) => {
    setCoalitions(prev => prev.filter(c => c.id !== coalitionId))
  }, [])

  const togglePartySelection = useCallback((party: string) => {
    setSelectedParties(prev =>
      prev.includes(party)
        ? prev.filter(p => p !== party)
        : [...prev, party]
    )
  }, [])

  // Obtener partidos no utilizados en coaliciones
  const unusedParties = useMemo(() => {
    const usedParties = new Set(coalitions.flatMap(c => c.parties))
    return parties.filter(party => !usedParties.has(party))
  }, [parties, coalitions])

  // Análisis comparativo
  const comparativeAnalysis = useMemo(() => {
    if (coalitions.length === 0) return null

    const analysis = coalitions.map(coalition => ({
      coalition,
      votes: coalitionResults[`coalition_${coalition.id}_votes`] || 0,
      sectionsWon: coalitionResults[`coalition_${coalition.id}_sections_won`] || 0,
      winPercentage: coalitionResults[`coalition_${coalition.id}_win_percentage`] || 0
    })).sort((a, b) => b.votes - a.votes)

    return analysis
  }, [coalitions, coalitionResults])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Constructor de Coaliciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="builder" className="space-y-4">
            <TabsList>
              <TabsTrigger value="builder">Crear Coaliciones</TabsTrigger>
              <TabsTrigger value="analysis">Análisis Comparativo</TabsTrigger>
              <TabsTrigger value="scenarios">Escenarios</TabsTrigger>
            </TabsList>

            <TabsContent value="builder" className="space-y-4">
              {/* Formulario para nueva coalición */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Nueva Coalición</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Nombre de la coalición:</label>
                      <Input
                        placeholder="Ej: Coalición Democrática"
                        value={newCoalitionName}
                        onChange={(e) => setNewCoalitionName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Color:</label>
                      <div className="flex gap-2">
                        {availableColors.map(color => (
                          <button
                            key={color}
                            className={`w-8 h-8 rounded-full border-2 ${selectedColor === color ? 'border-gray-800' : 'border-gray-300'
                              }`}
                            style={{ backgroundColor: color }}
                            onClick={() => setSelectedColor(color)}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-end">
                      <Button
                        onClick={addCoalition}
                        disabled={!newCoalitionName.trim() || selectedParties.length === 0}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Crear Coalición
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Seleccionar partidos ({selectedParties.length} seleccionados):
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {unusedParties.concat(selectedParties).map(party => (
                        <div key={party} className="flex items-center space-x-2">
                          <Checkbox
                            id={party}
                            checked={selectedParties.includes(party)}
                            onCheckedChange={() => togglePartySelection(party)}
                          />
                          <label htmlFor={party} className="text-sm cursor-pointer">
                            {party}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lista de coaliciones existentes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Coaliciones Creadas ({coalitions.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {coalitions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No hay coaliciones creadas aún</p>
                      <p className="text-sm">Crea tu primera coalición arriba</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {coalitions.map(coalition => (
                        <div key={coalition.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: coalition.color }}
                            />
                            <div>
                              <div className="font-medium">{coalition.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {coalition.parties.join(", ")}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {coalition.parties.length} partidos
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeCoalition(coalition.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              {comparativeAnalysis && comparativeAnalysis.length > 0 ? (
                <>
                  {/* Estadísticas generales */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard
                      title="Coaliciones Activas"
                      value={<AnimatedCounter end={coalitions.length} />}
                      icon={<Users className="h-4 w-4" />}
                      description="Coaliciones configuradas"
                    />
                    <StatCard
                      title="Coalición Líder"
                      value={comparativeAnalysis[0]?.coalition.name || "N/A"}
                      icon={<Award className="h-4 w-4" />}
                      description={`${comparativeAnalysis[0]?.votes.toLocaleString() || 0} votos`}
                    />
                    <StatCard
                      title="Mejor Rendimiento"
                      value={`${comparativeAnalysis[0]?.winPercentage.toFixed(1) || 0}%`}
                      icon={<TrendingUp className="h-4 w-4" />}
                      description="Secciones ganadas"
                    />
                  </div>

                  {/* Comparación detallada */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Comparación de Coaliciones</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {comparativeAnalysis.map((analysis, index) => (
                          <div key={analysis.coalition.id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <Badge variant={index === 0 ? "default" : "outline"}>
                                  #{index + 1}
                                </Badge>
                                <div
                                  className="w-4 h-4 rounded-full"
                                  style={{ backgroundColor: analysis.coalition.color }}
                                />
                                <div>
                                  <div className="font-medium">{analysis.coalition.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {analysis.coalition.parties.join(", ")}
                                  </div>
                                </div>
                              </div>
                              {index === 0 && (
                                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                  <Award className="h-3 w-3 mr-1" />
                                  Líder
                                </Badge>
                              )}
                            </div>

                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div className="text-center p-2 bg-muted/30 rounded">
                                <div className="font-bold text-lg">{analysis.votes.toLocaleString()}</div>
                                <div className="text-muted-foreground">Total Votos</div>
                              </div>
                              <div className="text-center p-2 bg-muted/30 rounded">
                                <div className="font-bold text-lg">{analysis.sectionsWon}</div>
                                <div className="text-muted-foreground">Secciones Ganadas</div>
                              </div>
                              <div className="text-center p-2 bg-muted/30 rounded">
                                <div className="font-bold text-lg">{analysis.winPercentage.toFixed(1)}%</div>
                                <div className="text-muted-foreground">% de Victoria</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Calculator className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">
                      Crea al menos una coalición para ver el análisis comparativo
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="scenarios" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Simulación de Escenarios</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Funcionalidad de simulación de escenarios</p>
                    <p className="text-sm">Próximamente: Análisis de diferentes combinaciones de coaliciones</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

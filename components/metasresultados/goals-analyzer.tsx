"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Target, TrendingUp, Users, MapPin, Calculator, Lightbulb, AlertTriangle, CheckCircle, BarChart3, Flag } from 'lucide-react'

interface GoalsAnalyzerProps {
  data: any[]
}

// Partidos y coaliciones mexicanos específicos
const MEXICAN_PARTIES = [
  'PAN', 'PVEM_PT', 'PRI', 'PVEM', 'NO_REGISTRADAS', 'NULOS', 'PT', 'MC', 'PRD',
  'PAN-PRI-PRD', 'PAN-PRI', 'PAN-PRD', 'PRI-PRD', 'PVEM_PT_MORENA', 'PVEM_MORENA',
  'PT_MORENA', 'MORENA'
]

// Nombres completos de partidos
const PARTY_NAMES: Record<string, string> = {
  'PAN': 'Partido Acción Nacional',
  'PRI': 'Partido Revolucionario Institucional',
  'PRD': 'Partido de la Revolución Democrática',
  'PVEM': 'Partido Verde Ecologista de México',
  'PT': 'Partido del Trabajo',
  'MC': 'Movimiento Ciudadano',
  'MORENA': 'Movimiento Regeneración Nacional',
  'PVEM_PT': 'Coalición PVEM-PT',
  'NO_REGISTRADAS': 'Candidaturas No Registradas',
  'NULOS': 'Votos Nulos',
  'PAN-PRI-PRD': 'Coalición PAN-PRI-PRD',
  'PAN-PRI': 'Coalición PAN-PRI',
  'PAN-PRD': 'Coalición PAN-PRD',
  'PRI-PRD': 'Coalición PRI-PRD',
  'PVEM_PT_MORENA': 'Coalición PVEM-PT-MORENA',
  'PVEM_MORENA': 'Coalición PVEM-MORENA',
  'PT_MORENA': 'Coalición PT-MORENA'
}

export function GoalsAnalyzer({ data }: GoalsAnalyzerProps) {
  const [selectedParty, setSelectedParty] = useState<string>("")
  const [targetPercentage, setTargetPercentage] = useState<number>(50)
  const [targetVotes, setTargetVotes] = useState<string>("")
  const [analysisType, setAnalysisType] = useState<"percentage" | "votes" | "growth">("percentage")

  // Análisis de datos por partido mexicano
  const partyAnalysis = useMemo(() => {
    if (!data || data.length === 0) return { parties: [], municipalities: [], districts: [], totalVotes: 0, totalListaNominal: 0 }

    // Calcular totales por partido
    const parties = MEXICAN_PARTIES.map(party => {
      const total = data.reduce((sum, row) => sum + (Number(row[party]) || 0), 0)
      return {
        name: party,
        fullName: PARTY_NAMES[party] || party,
        votes: total,
        isCoalition: party.includes('-') || party.includes('_'),
        type: party === 'NULOS' ? 'null' :
          party === 'NO_REGISTRADAS' ? 'non_registered' :
            party.includes('-') || party.includes('_') ? 'coalition' : 'party'
      }
    }).filter(party => party.votes > 0)

    const totalVotes = parties.reduce((sum, party) => sum + party.votes, 0)
    const totalListaNominal = data.reduce((sum, row) => sum + (Number(row.LISTA_NOMINAL) || 0), 0)

    parties.forEach(party => {
      party.percentage = totalVotes > 0 ? (party.votes / totalVotes) * 100 : 0
      party.participationShare = totalListaNominal > 0 ? (party.votes / totalListaNominal) * 100 : 0
    })

    // Análisis por municipio
    const municipalityMap = new Map()
    data.forEach(row => {
      const municipality = row.MUNICIPIO || row.municipio || 'Sin especificar'
      if (!municipalityMap.has(municipality)) {
        municipalityMap.set(municipality, {
          name: municipality,
          parties: {},
          totalVotes: 0,
          listaNominal: 0
        })
      }

      const munData = municipalityMap.get(municipality)
      munData.listaNominal += Number(row.LISTA_NOMINAL) || 0

      MEXICAN_PARTIES.forEach(party => {
        const votes = Number(row[party]) || 0
        if (!munData.parties[party]) {
          munData.parties[party] = 0
        }
        munData.parties[party] += votes
        munData.totalVotes += votes
      })
    })

    const municipalities = Array.from(municipalityMap.values()).map(mun => {
      Object.keys(mun.parties).forEach(party => {
        mun.parties[party + '_percentage'] = mun.totalVotes > 0 ? (mun.parties[party] / mun.totalVotes) * 100 : 0
      })
      mun.participation = mun.listaNominal > 0 ? (mun.totalVotes / mun.listaNominal) * 100 : 0
      return mun
    })

    // Análisis por distrito
    const districtMap = new Map()
    data.forEach(row => {
      const district = row.DISTRITO || row.distrito || 'Sin especificar'
      if (!districtMap.has(district)) {
        districtMap.set(district, { name: district, parties: {}, totalVotes: 0 })
      }

      const distData = districtMap.get(district)
      MEXICAN_PARTIES.forEach(party => {
        const votes = Number(row[party]) || 0
        if (!distData.parties[party]) {
          distData.parties[party] = 0
        }
        distData.parties[party] += votes
        distData.totalVotes += votes
      })
    })

    const districts = Array.from(districtMap.values()).map(dist => {
      Object.keys(dist.parties).forEach(party => {
        dist.parties[party + '_percentage'] = dist.totalVotes > 0 ? (dist.parties[party] / dist.totalVotes) * 100 : 0
      })
      return dist
    })

    return {
      parties: parties.sort((a, b) => b.votes - a.votes),
      municipalities,
      districts,
      totalVotes,
      totalListaNominal
    }
  }, [data])

  // Análisis específico del partido seleccionado
  const selectedPartyAnalysis = useMemo(() => {
    if (!selectedParty || !partyAnalysis.parties.length) return null

    const party = partyAnalysis.parties.find(p => p.name === selectedParty)
    if (!party) return null

    // Rendimiento por municipio
    const municipalityPerformance = partyAnalysis.municipalities.map(mun => ({
      name: mun.name,
      votes: mun.parties[selectedParty] || 0,
      percentage: mun.parties[selectedParty + '_percentage'] || 0,
      totalVotes: mun.totalVotes,
      listaNominal: mun.listaNominal,
      participation: mun.participation
    })).sort((a, b) => b.percentage - a.percentage)

    // Clasificar municipios por fortaleza
    const strongMunicipalities = municipalityPerformance.filter(mun => mun.percentage > 40)
    const competitiveMunicipalities = municipalityPerformance.filter(mun =>
      mun.percentage >= 25 && mun.percentage <= 40
    )
    const weakMunicipalities = municipalityPerformance.filter(mun => mun.percentage < 25)

    // Análisis de potencial de crecimiento
    const growthPotential = municipalityPerformance.map(mun => {
      const currentShare = mun.listaNominal > 0 ? (mun.votes / mun.listaNominal) * 100 : 0
      const maxPotential = mun.participation // Máximo basado en participación actual
      const growthRoom = Math.max(0, maxPotential - currentShare)

      return {
        ...mun,
        currentShare,
        maxPotential,
        growthRoom,
        potentialVotes: Math.round((growthRoom / 100) * mun.listaNominal)
      }
    }).sort((a, b) => b.potentialVotes - a.potentialVotes)

    return {
      party,
      municipalityPerformance,
      strongMunicipalities,
      competitiveMunicipalities,
      weakMunicipalities,
      growthPotential,
      totalMunicipalities: partyAnalysis.municipalities.length
    }
  }, [selectedParty, partyAnalysis])

  // Cálculo de metas y estrategias
  const goalAnalysis = useMemo(() => {
    if (!selectedPartyAnalysis) return null

    const currentPercentage = selectedPartyAnalysis.party.percentage
    const currentVotes = selectedPartyAnalysis.party.votes
    const currentParticipationShare = selectedPartyAnalysis.party.participationShare

    // Calcular votos necesarios según el tipo de análisis
    let targetVotesNumber = 0
    let targetPercentageNumber = targetPercentage

    if (analysisType === "votes" && targetVotes) {
      targetVotesNumber = Number(targetVotes)
      targetPercentageNumber = partyAnalysis.totalVotes > 0 ?
        (targetVotesNumber / partyAnalysis.totalVotes) * 100 : 0
    } else if (analysisType === "percentage") {
      targetVotesNumber = (partyAnalysis.totalVotes * targetPercentage) / 100
    } else if (analysisType === "growth") {
      targetVotesNumber = currentVotes * (1 + targetPercentage / 100)
      targetPercentageNumber = partyAnalysis.totalVotes > 0 ?
        (targetVotesNumber / partyAnalysis.totalVotes) * 100 : 0
    }

    const votesNeeded = Math.max(0, targetVotesNumber - currentVotes)
    const percentageGap = targetPercentageNumber - currentPercentage

    // Análisis de viabilidad
    const viability = votesNeeded === 0 ? "achieved" :
      votesNeeded <= currentVotes * 0.1 ? "very_high" :
        votesNeeded <= currentVotes * 0.25 ? "high" :
          votesNeeded <= currentVotes * 0.5 ? "medium" :
            votesNeeded <= currentVotes * 1 ? "low" : "very_low"

    // Estrategias específicas para el contexto mexicano
    const strategies = []

    // Estrategia de consolidación en fortalezas
    if (selectedPartyAnalysis.strongMunicipalities.length > 0) {
      const strongVotes = selectedPartyAnalysis.strongMunicipalities.reduce((sum, mun) => sum + mun.votes, 0)
      strategies.push({
        type: "consolidation",
        title: "Consolidar fortalezas electorales",
        description: `Mantener y aumentar participación en ${selectedPartyAnalysis.strongMunicipalities.length} municipios donde ya eres fuerte (>40%)`,
        priority: "high",
        impact: strongVotes,
        municipalities: selectedPartyAnalysis.strongMunicipalities.length,
        potentialGain: Math.round(strongVotes * 0.1) // 10% de crecimiento conservador
      })
    }

    // Estrategia de expansión en municipios competitivos
    if (selectedPartyAnalysis.competitiveMunicipalities.length > 0) {
      const competitiveVotes = selectedPartyAnalysis.competitiveMunicipalities.reduce((sum, mun) => sum + mun.votes, 0)
      strategies.push({
        type: "expansion",
        title: "Expandir en territorios competitivos",
        description: `Invertir recursos en ${selectedPartyAnalysis.competitiveMunicipalities.length} municipios competitivos (25-40%)`,
        priority: "high",
        impact: competitiveVotes,
        municipalities: selectedPartyAnalysis.competitiveMunicipalities.length,
        potentialGain: Math.round(competitiveVotes * 0.25) // 25% de crecimiento agresivo
      })
    }

    // Estrategia de crecimiento en municipios débiles con alto potencial
    const topGrowthMunicipalities = selectedPartyAnalysis.growthPotential
      .filter(mun => mun.potentialVotes > 0)
      .slice(0, 10)

    if (topGrowthMunicipalities.length > 0) {
      const potentialVotes = topGrowthMunicipalities.reduce((sum, mun) => sum + mun.potentialVotes, 0)
      strategies.push({
        type: "growth",
        title: "Aprovechar potencial de crecimiento",
        description: `Enfocar en los 10 municipios con mayor potencial de nuevos votos`,
        priority: "medium",
        impact: potentialVotes,
        municipalities: topGrowthMunicipalities.length,
        potentialGain: potentialVotes
      })
    }

    // Estrategia de movilización (aumentar participación)
    const lowParticipationMunicipalities = selectedPartyAnalysis.municipalityPerformance
      .filter(mun => mun.participation < 60 && mun.percentage > 30)
      .slice(0, 5)

    if (lowParticipationMunicipalities.length > 0) {
      const mobilizationPotential = lowParticipationMunicipalities.reduce((sum, mun) => {
        const additionalParticipation = Math.min(20, 70 - mun.participation) // Hasta 20% más de participación
        return sum + Math.round((additionalParticipation / 100) * mun.listaNominal * (mun.percentage / 100))
      }, 0)

      strategies.push({
        type: "mobilization",
        title: "Movilizar base electoral",
        description: `Aumentar participación en municipios con baja participación pero buena preferencia`,
        priority: "medium",
        impact: mobilizationPotential,
        municipalities: lowParticipationMunicipalities.length,
        potentialGain: mobilizationPotential
      })
    }

    // Ordenar estrategias por ganancia potencial
    strategies.sort((a, b) => b.potentialGain - a.potentialGain)

    return {
      currentPercentage,
      currentVotes,
      currentParticipationShare,
      targetVotes: targetVotesNumber,
      targetPercentage: targetPercentageNumber,
      votesNeeded,
      percentageGap,
      viability,
      strategies,
      totalPotentialGain: strategies.reduce((sum, s) => sum + s.potentialGain, 0)
    }
  }, [selectedPartyAnalysis, targetPercentage, targetVotes, analysisType, partyAnalysis.totalVotes, partyAnalysis.totalListaNominal])

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Análisis de Metas Electorales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Flag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay datos disponibles para el análisis de metas</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Configuración de análisis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Configuración de Metas Electorales - México
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="party-select">Partido/Coalición</Label>
              <Select value={selectedParty} onValueChange={setSelectedParty}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar partido" />
                </SelectTrigger>
                <SelectContent>
                  {partyAnalysis.parties.map(party => (
                    <SelectItem key={party.name} value={party.name}>
                      <div className="flex items-center gap-2">
                        <span>{party.name}</span>
                        {party.isCoalition && (
                          <Badge variant="outline" className="text-xs">Coalición</Badge>
                        )}
                        <span className="text-muted-foreground">({party.percentage.toFixed(1)}%)</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="analysis-type">Tipo de análisis</Label>
              <Select value={analysisType} onValueChange={(value: "percentage" | "votes" | "growth") => setAnalysisType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Meta por porcentaje</SelectItem>
                  <SelectItem value="votes">Meta por votos absolutos</SelectItem>
                  <SelectItem value="growth">Meta por crecimiento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {analysisType === "percentage" && (
              <div>
                <Label htmlFor="target-percentage">Meta objetivo (%)</Label>
                <Input
                  id="target-percentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={targetPercentage}
                  onChange={(e) => setTargetPercentage(Number(e.target.value))}
                />
              </div>
            )}

            {analysisType === "votes" && (
              <div>
                <Label htmlFor="target-votes">Meta en votos</Label>
                <Input
                  id="target-votes"
                  type="number"
                  min="0"
                  value={targetVotes}
                  onChange={(e) => setTargetVotes(e.target.value)}
                  placeholder="Ej: 1000000"
                />
              </div>
            )}

            {analysisType === "growth" && (
              <div>
                <Label htmlFor="growth-percentage">Crecimiento deseado (%)</Label>
                <Input
                  id="growth-percentage"
                  type="number"
                  min="0"
                  max="500"
                  step="1"
                  value={targetPercentage}
                  onChange={(e) => setTargetPercentage(Number(e.target.value))}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Análisis de metas */}
      {selectedParty && goalAnalysis && (
        <div className="space-y-6">
          {/* Resumen de la meta */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Análisis de Meta - {selectedParty}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="text-sm text-muted-foreground mb-2">
                  <strong>Partido:</strong> {selectedPartyAnalysis.party.fullName}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {goalAnalysis.currentVotes.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Votos actuales</div>
                  <div className="text-xs text-blue-600">
                    {goalAnalysis.currentPercentage.toFixed(1)}% del total
                  </div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {goalAnalysis.targetVotes.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Meta objetivo</div>
                  <div className="text-xs text-green-600">
                    {goalAnalysis.targetPercentage.toFixed(1)}% del total
                  </div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {goalAnalysis.votesNeeded.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Votos necesarios</div>
                  <div className="text-xs text-orange-600">
                    {goalAnalysis.percentageGap > 0 ? `+${goalAnalysis.percentageGap.toFixed(1)}%` : 'Meta alcanzada'}
                  </div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {goalAnalysis.totalPotentialGain.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Potencial total</div>
                  <div className="text-xs text-purple-600">
                    Ganancia estimada
                  </div>
                </div>
              </div>

              {/* Indicador de viabilidad */}
              <Alert className={
                goalAnalysis.viability === "achieved" ? "border-green-200 bg-green-50" :
                  goalAnalysis.viability === "very_high" || goalAnalysis.viability === "high" ? "border-blue-200 bg-blue-50" :
                    goalAnalysis.viability === "medium" ? "border-yellow-200 bg-yellow-50" :
                      "border-red-200 bg-red-50"
              }>
                <div className="flex items-center gap-2">
                  {goalAnalysis.viability === "achieved" ? <CheckCircle className="h-4 w-4" /> :
                    goalAnalysis.viability === "very_high" || goalAnalysis.viability === "high" ? <TrendingUp className="h-4 w-4" /> :
                      <AlertTriangle className="h-4 w-4" />}
                  <AlertTitle>
                    {goalAnalysis.viability === "achieved" ? "Meta ya alcanzada" :
                      goalAnalysis.viability === "very_high" ? "Viabilidad muy alta" :
                        goalAnalysis.viability === "high" ? "Viabilidad alta" :
                          goalAnalysis.viability === "medium" ? "Viabilidad media" :
                            goalAnalysis.viability === "low" ? "Viabilidad baja" :
                              "Meta muy ambiciosa"}
                  </AlertTitle>
                </div>
                <AlertDescription>
                  {goalAnalysis.viability === "achieved" ?
                    "El partido ya ha superado la meta establecida." :
                    `Se requieren ${goalAnalysis.votesNeeded.toLocaleString()} votos adicionales (${goalAnalysis.percentageGap.toFixed(1)} puntos porcentuales) para alcanzar la meta.`
                  }
                </AlertDescription>
              </Alert>

              {/* Progreso hacia la meta */}
              {goalAnalysis.votesNeeded > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Progreso hacia la meta</span>
                    <span className="text-sm text-muted-foreground">
                      {((goalAnalysis.currentVotes / goalAnalysis.targetVotes) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress
                    value={Math.min((goalAnalysis.currentVotes / goalAnalysis.targetVotes) * 100, 100)}
                    className="h-3"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Estrategias recomendadas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Estrategias Recomendadas para México
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {goalAnalysis.strategies.map((strategy, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-lg">{strategy.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {strategy.description}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <Badge variant={
                          strategy.priority === "high" ? "destructive" :
                            strategy.priority === "medium" ? "default" : "secondary"
                        }>
                          {strategy.priority === "high" ? "Alta prioridad" :
                            strategy.priority === "medium" ? "Media prioridad" : "Baja prioridad"}
                        </Badge>
                        <Badge variant="outline" className="text-center">
                          {strategy.municipalities} municipios
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                      <div className="text-center p-3 bg-muted/30 rounded">
                        <div className="font-bold text-lg">{strategy.impact.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">Votos base</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded">
                        <div className="font-bold text-lg text-green-600">
                          +{strategy.potentialGain.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">Ganancia potencial</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded">
                        <div className="font-bold text-lg text-blue-600">
                          {goalAnalysis.votesNeeded > 0 ?
                            Math.min(100, (strategy.potentialGain / goalAnalysis.votesNeeded) * 100).toFixed(1) : 0}%
                        </div>
                        <div className="text-sm text-muted-foreground">Contribución a meta</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {goalAnalysis.totalPotentialGain >= goalAnalysis.votesNeeded && goalAnalysis.votesNeeded > 0 && (
                <Alert className="mt-4 border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle className="text-green-800">Meta alcanzable</AlertTitle>
                  <AlertDescription className="text-green-700">
                    Las estrategias combinadas pueden generar {goalAnalysis.totalPotentialGain.toLocaleString()} votos adicionales,
                    superando los {goalAnalysis.votesNeeded.toLocaleString()} votos necesarios para alcanzar la meta.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Análisis detallado por municipio */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Rendimiento Municipal Detallado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="strong" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="strong">
                    Fortalezas ({selectedPartyAnalysis.strongMunicipalities.length})
                  </TabsTrigger>
                  <TabsTrigger value="competitive">
                    Competitivos ({selectedPartyAnalysis.competitiveMunicipalities.length})
                  </TabsTrigger>
                  <TabsTrigger value="weak">
                    Débiles ({selectedPartyAnalysis.weakMunicipalities.length})
                  </TabsTrigger>
                  <TabsTrigger value="potential">
                    Potencial (Top 10)
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="strong" className="space-y-3">
                  {selectedPartyAnalysis.strongMunicipalities.slice(0, 10).map((mun, index) => (
                    <div key={mun.name} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <div className="font-medium">{mun.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {mun.votes.toLocaleString()} votos • Participación: {mun.participation.toFixed(1)}%
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">{mun.percentage.toFixed(1)}%</div>
                        <div className="text-xs text-muted-foreground">Posición dominante</div>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="competitive" className="space-y-3">
                  {selectedPartyAnalysis.competitiveMunicipalities.slice(0, 10).map((mun, index) => (
                    <div key={mun.name} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div>
                        <div className="font-medium">{mun.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {mun.votes.toLocaleString()} votos • Participación: {mun.participation.toFixed(1)}%
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-yellow-600">{mun.percentage.toFixed(1)}%</div>
                        <div className="text-xs text-muted-foreground">Territorio disputado</div>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="weak" className="space-y-3">
                  {selectedPartyAnalysis.weakMunicipalities
                    .sort((a, b) => b.totalVotes - a.totalVotes)
                    .slice(0, 10)
                    .map((mun, index) => (
                      <div key={mun.name} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div>
                          <div className="font-medium">{mun.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {mun.votes.toLocaleString()} votos • Participación: {mun.participation.toFixed(1)}%
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-red-600">{mun.percentage.toFixed(1)}%</div>
                          <div className="text-xs text-muted-foreground">Requiere inversión</div>
                        </div>
                      </div>
                    ))}
                </TabsContent>

                <TabsContent value="potential" className="space-y-3">
                  {selectedPartyAnalysis.growthPotential.slice(0, 10).map((mun, index) => (
                    <div key={mun.name} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div>
                        <div className="font-medium">{mun.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Actual: {mun.votes.toLocaleString()} votos ({mun.percentage.toFixed(1)}%)
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Participación: {mun.participation.toFixed(1)}% • Lista: {mun.listaNominal.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-purple-600">
                          +{mun.potentialVotes.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">Votos potenciales</div>
                        <div className="text-xs text-purple-600">
                          {mun.growthRoom.toFixed(1)}% margen
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Resumen general de partidos */}
      {!selectedParty && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Panorama Electoral Mexicano
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Selecciona un partido o coalición para comenzar el análisis de metas y estrategias electorales.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {partyAnalysis.totalVotes.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total de Votos Emitidos</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {partyAnalysis.totalListaNominal.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Lista Nominal Total</div>
                </div>
              </div>

              <div className="grid gap-3">
                {partyAnalysis.parties.slice(0, 12).map((party, index) => (
                  <div key={party.name} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedParty(party.name)}>
                    <div className="flex items-center gap-3">
                      <Badge variant={index < 3 ? "default" : "secondary"}>
                        #{index + 1}
                      </Badge>
                      <div>
                        <span className="font-medium">{party.name}</span>
                        <div className="text-xs text-muted-foreground">{party.fullName}</div>
                      </div>
                      {party.isCoalition && (
                        <Badge variant="outline" className="text-xs">Coalición</Badge>
                      )}
                      {party.type === 'null' && (
                        <Badge variant="destructive" className="text-xs">Nulos</Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{party.votes.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">
                        {party.percentage.toFixed(2)}% • {party.participationShare.toFixed(2)}% de lista
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

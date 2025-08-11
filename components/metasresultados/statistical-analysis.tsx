"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatCard } from "@/components/ui/stat-card"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { Trophy, TrendingUp, TrendingDown, Target, Award, Users, MapPin, BarChart3 } from 'lucide-react'

interface StatisticalAnalysisProps {
    data: any[]
    selectedParty: string
    onPartyChange: (party: string) => void
    selectedMunicipio?: string
    selectedDistrito?: string
    selectedSeccion?: string
}

// Partidos mexicanos específicos (excluyendo DISTRITO_F y DISTRITO_L)
const MEXICAN_PARTIES = [
    'PAN', 'PVEM_PT', 'PRI', 'PVEM', 'NO_REGISTRADAS', 'NULOS', 'PT', 'MC', 'PRD',
    'PAN-PRI-PRD', 'PAN-PRI', 'PAN-PRD', 'PRI-PRD', 'PVEM_PT_MORENA', 'PVEM_MORENA',
    'PT_MORENA', 'MORENA'
]

// Colores oficiales de partidos mexicanos
const PARTY_COLORS: Record<string, string> = {
    'PAN': '#0066CC',           // Azul oficial
    'PRI': '#FF0000',           // Rojo oficial
    'PRD': '#FFFF00',           // Amarillo oficial
    'PVEM': '#00AA00',          // Verde oficial
    'PT': '#CC0000',            // Rojo oscuro
    'MC': '#FF6600',            // Naranja oficial
    'MORENA': '#8B4513',        // Café/Marrón oficial
    'NULOS': '#808080',         // Gris
    'NO_REGISTRADAS': '#C0C0C0', // Gris claro
    'PVEM_PT': '#66AA66',       // Verde claro (coalición)
    'PAN-PRI-PRD': '#6666CC',   // Mezcla azul-rojo-amarillo
    'PAN-PRI': '#8033CC',       // Mezcla azul-rojo
    'PAN-PRD': '#80CC33',       // Mezcla azul-amarillo
    'PRI-PRD': '#FF8000',       // Mezcla rojo-amarillo
    'PVEM_PT_MORENA': '#4D7A4D', // Verde-café
    'PVEM_MORENA': '#5D8A5D',   // Verde-café claro
    'PT_MORENA': '#A0522D'      // Rojo-café
}

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

export function StatisticalAnalysis({
    data,
    selectedParty,
    onPartyChange,
    selectedMunicipio,
    selectedDistrito,
    selectedSeccion
}: StatisticalAnalysisProps) {
    const [analysisType, setAnalysisType] = useState<"wins" | "performance" | "comparison">("wins")

    // Análisis estadístico completo
    const statisticalAnalysis = useMemo(() => {
        if (!data || !Array.isArray(data) || data.length === 0 || !selectedParty) {
            return null
        }

        // Filtrar datos según selección
        let filteredData = [...data]

        if (selectedMunicipio && selectedMunicipio !== "todos") {
            filteredData = filteredData.filter(row =>
                (row.MUNICIPIO || row.municipio) === selectedMunicipio
            )
        }

        if (selectedDistrito && selectedDistrito !== "todos") {
            filteredData = filteredData.filter(row =>
                (row.DISTRITO || row.distrito) === selectedDistrito
            )
        }

        if (selectedSeccion && selectedSeccion !== "todos") {
            filteredData = filteredData.filter(row =>
                (row.SECCION || row.seccion)?.toString() === selectedSeccion
            )
        }

        // Calcular ganador por sección
        const sectionAnalysis = filteredData.map(row => {
            const sectionResults: { party: string; votes: number }[] = []

            MEXICAN_PARTIES.forEach(party => {
                const votes = Number(row[party]) || 0
                sectionResults.push({ party, votes })
            })

            // Ordenar por votos descendente
            sectionResults.sort((a, b) => b.votes - a.votes)

            const winner = sectionResults[0]
            const runnerUp = sectionResults[1] || { party: '', votes: 0 }
            const selectedPartyVotes = Number(row[selectedParty]) || 0
            const selectedPartyPosition = sectionResults.findIndex(r => r.party === selectedParty) + 1
            const totalVotes = sectionResults.reduce((sum, r) => sum + r.votes, 0)
            const margin = winner.votes - runnerUp.votes
            const marginPercentage = totalVotes > 0 ? (margin / totalVotes) * 100 : 0

            return {
                seccion: row.SECCION || row.seccion,
                municipio: row.MUNICIPIO || row.municipio || 'No especificado',
                distrito: row.DISTRITO || row.distrito || 'No especificado',
                winner: winner.party,
                winnerVotes: winner.votes,
                runnerUp: runnerUp.party,
                runnerUpVotes: runnerUp.votes,
                selectedPartyVotes,
                selectedPartyPosition,
                totalVotes,
                margin,
                marginPercentage,
                isWin: winner.party === selectedParty,
                listaNominal: Number(row.LISTA_NOMINAL) || 0
            }
        })

        // Estadísticas generales
        const totalSections = sectionAnalysis.length
        const sectionsWon = sectionAnalysis.filter(s => s.isWin).length
        const sectionsLost = totalSections - sectionsWon
        const winPercentage = totalSections > 0 ? (sectionsWon / totalSections) * 100 : 0

        // Votos totales
        const totalVotesForParty = sectionAnalysis.reduce((sum, s) => sum + s.selectedPartyVotes, 0)
        const totalVotesOverall = sectionAnalysis.reduce((sum, s) => sum + s.totalVotes, 0)
        const voteSharePercentage = totalVotesOverall > 0 ? (totalVotesForParty / totalVotesOverall) * 100 : 0

        // Secciones con mejores y peores resultados
        const bestSections = sectionAnalysis
            .filter(s => s.selectedPartyVotes > 0)
            .sort((a, b) => b.selectedPartyVotes - a.selectedPartyVotes)
            .slice(0, 10)

        const worstSections = sectionAnalysis
            .filter(s => s.selectedPartyVotes > 0)
            .sort((a, b) => a.selectedPartyVotes - b.selectedPartyVotes)
            .slice(0, 10)

        // Análisis por municipio
        const municipioAnalysis = new Map<string, {
            municipio: string
            totalSections: number
            sectionsWon: number
            totalVotes: number
            winPercentage: number
        }>()

        sectionAnalysis.forEach(section => {
            const municipio = section.municipio
            if (!municipioAnalysis.has(municipio)) {
                municipioAnalysis.set(municipio, {
                    municipio,
                    totalSections: 0,
                    sectionsWon: 0,
                    totalVotes: 0,
                    winPercentage: 0
                })
            }

            const analysis = municipioAnalysis.get(municipio)!
            analysis.totalSections++
            analysis.totalVotes += section.selectedPartyVotes
            if (section.isWin) {
                analysis.sectionsWon++
            }
            analysis.winPercentage = (analysis.sectionsWon / analysis.totalSections) * 100
        })

        const municipioResults = Array.from(municipioAnalysis.values())
            .sort((a, b) => b.winPercentage - a.winPercentage)

        // Márgenes de victoria/derrota
        const victories = sectionAnalysis.filter(s => s.isWin)
        const defeats = sectionAnalysis.filter(s => !s.isWin)

        const avgVictoryMargin = victories.length > 0
            ? victories.reduce((sum, v) => sum + v.marginPercentage, 0) / victories.length
            : 0

        const avgDefeatMargin = defeats.length > 0
            ? defeats.reduce((sum, d) => sum + Math.abs(d.marginPercentage), 0) / defeats.length
            : 0

        // Análisis de los dos lugares más altos
        const overallResults = MEXICAN_PARTIES.map(party => {
            const totalVotes = sectionAnalysis.reduce((sum, s) => {
                const votes = Number(filteredData.find(row =>
                    (row.SECCION || row.seccion) === s.seccion
                )?.[party]) || 0
                return sum + votes
            }, 0)

            return {
                party,
                votes: totalVotes,
                percentage: totalVotesOverall > 0 ? (totalVotes / totalVotesOverall) * 100 : 0
            }
        }).sort((a, b) => b.votes - a.votes)

        const firstPlace = overallResults[0]
        const secondPlace = overallResults[1]

        return {
            totalSections,
            sectionsWon,
            sectionsLost,
            winPercentage,
            totalVotesForParty,
            totalVotesOverall,
            voteSharePercentage,
            bestSections,
            worstSections,
            municipioResults,
            avgVictoryMargin,
            avgDefeatMargin,
            sectionAnalysis,
            firstPlace,
            secondPlace,
            overallResults
        }
    }, [data, selectedParty, selectedMunicipio, selectedDistrito, selectedSeccion])

    if (!statisticalAnalysis) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Análisis Estadístico Detallado</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        Selecciona un partido para ver el análisis estadístico detallado.
                    </p>
                </CardContent>
            </Card>
        )
    }

    const getFilterContext = () => {
        const filters = []
        if (selectedDistrito && selectedDistrito !== "todos") filters.push(`Distrito: ${selectedDistrito}`)
        if (selectedMunicipio && selectedMunicipio !== "todos") filters.push(`Municipio: ${selectedMunicipio}`)
        if (selectedSeccion && selectedSeccion !== "todos") filters.push(`Sección: ${selectedSeccion}`)
        return filters.length > 0 ? filters.join(" • ") : "Todos los datos"
    }

    const selectedPartyColor = PARTY_COLORS[selectedParty] || '#8884d8'

    return (
        <div className="space-y-6">
            {/* Selector de partido */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Análisis Estadístico Detallado
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <div className="flex-1">
                            <label className="text-sm font-medium mb-2 block">Partido/Coalición a analizar:</label>
                            <Select value={selectedParty} onValueChange={onPartyChange}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Seleccionar partido" />
                                </SelectTrigger>
                                <SelectContent>
                                    {MEXICAN_PARTIES.map((party) => (
                                        <SelectItem key={party} value={party}>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: PARTY_COLORS[party] || '#8884d8' }}
                                                />
                                                {party} - {PARTY_NAMES[party] || party}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            <p><strong>Contexto:</strong> {getFilterContext()}</p>
                            <p><strong>Secciones analizadas:</strong> {statisticalAnalysis.totalSections}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Dos lugares más altos */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5" />
                        Dos Lugares Más Altos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg bg-gradient-to-b from-yellow-50 to-yellow-100 border-yellow-200">
                            <div className="flex items-center gap-2 mb-2">
                                <Trophy className="h-5 w-5 text-yellow-600" />
                                <span className="font-medium">Primer Lugar</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: PARTY_COLORS[statisticalAnalysis.firstPlace.party] || '#8884d8' }}
                                />
                                <div>
                                    <div className="font-bold text-lg">{statisticalAnalysis.firstPlace.party}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {statisticalAnalysis.firstPlace.votes.toLocaleString()} votos
                                        ({statisticalAnalysis.firstPlace.percentage.toFixed(2)}%)
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border rounded-lg bg-gradient-to-b from-gray-50 to-gray-100 border-gray-200">
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary" className="h-5 w-5 rounded-full flex items-center justify-center text-xs">
                                    2
                                </Badge>
                                <span className="font-medium">Segundo Lugar</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: PARTY_COLORS[statisticalAnalysis.secondPlace.party] || '#8884d8' }}
                                />
                                <div>
                                    <div className="font-bold text-lg">{statisticalAnalysis.secondPlace.party}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {statisticalAnalysis.secondPlace.votes.toLocaleString()} votos
                                        ({statisticalAnalysis.secondPlace.percentage.toFixed(2)}%)
                                    </div>
                                </div>
                            </div>
                            <div className="mt-2 text-xs text-muted-foreground">
                                Diferencia: {(statisticalAnalysis.firstPlace.votes - statisticalAnalysis.secondPlace.votes).toLocaleString()} votos
                                ({(statisticalAnalysis.firstPlace.percentage - statisticalAnalysis.secondPlace.percentage).toFixed(2)}%)
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Estadísticas principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Secciones Ganadas"
                    value={<AnimatedCounter end={statisticalAnalysis.sectionsWon} />}
                    icon={<Trophy className="h-4 w-4" />}
                    description={`${statisticalAnalysis.winPercentage.toFixed(1)}% del total`}
                    trend={statisticalAnalysis.winPercentage > 50 ? "up" : "down"}
                />

                <StatCard
                    title="Secciones Perdidas"
                    value={<AnimatedCounter end={statisticalAnalysis.sectionsLost} />}
                    icon={<TrendingDown className="h-4 w-4" />}
                    description={`${(100 - statisticalAnalysis.winPercentage).toFixed(1)}% del total`}
                />

                <StatCard
                    title="Total de Votos"
                    value={<AnimatedCounter end={statisticalAnalysis.totalVotesForParty} />}
                    icon={<Users className="h-4 w-4" />}
                    description={`${statisticalAnalysis.voteSharePercentage.toFixed(1)}% del total`}
                />

                <StatCard
                    title="Margen Promedio Victoria"
                    value={`${statisticalAnalysis.avgVictoryMargin.toFixed(1)}%`}
                    icon={<Target className="h-4 w-4" />}
                    description="Diferencia promedio al ganar"
                    trend={statisticalAnalysis.avgVictoryMargin > 10 ? "up" : undefined}
                />
            </div>

            {/* Análisis detallado por pestañas */}
            <Tabs value={analysisType} onValueChange={(value: any) => setAnalysisType(value)} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="wins">Victorias y Derrotas</TabsTrigger>
                    <TabsTrigger value="performance">Rendimiento por Zona</TabsTrigger>
                    <TabsTrigger value="comparison">Comparación Detallada</TabsTrigger>
                </TabsList>

                <TabsContent value="wins" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Mejores secciones */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="h-5 w-5 text-yellow-500" />
                                    Top 10 Mejores Secciones
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {statisticalAnalysis.bestSections.map((section, index) => (
                                        <div key={section.seccion} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                            <div>
                                                <div className="font-medium">Sección {section.seccion}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {section.municipio} - {section.distrito}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-lg">{section.selectedPartyVotes.toLocaleString()}</div>
                                                <Badge
                                                    variant={section.isWin ? "default" : "secondary"}
                                                    style={section.isWin ? { backgroundColor: selectedPartyColor, color: 'white' } : {}}
                                                >
                                                    {section.isWin ? "Ganó" : `#${section.selectedPartyPosition}`}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Peores secciones */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingDown className="h-5 w-5 text-red-500" />
                                    Secciones con Menor Rendimiento
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {statisticalAnalysis.worstSections.map((section, index) => (
                                        <div key={section.seccion} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                            <div>
                                                <div className="font-medium">Sección {section.seccion}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {section.municipio} - {section.distrito}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-lg">{section.selectedPartyVotes.toLocaleString()}</div>
                                                <Badge
                                                    variant={section.isWin ? "default" : "outline"}
                                                    style={section.isWin ? { backgroundColor: selectedPartyColor, color: 'white' } : {}}
                                                >
                                                    {section.isWin ? "Ganó" : `#${section.selectedPartyPosition}`}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="performance" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Rendimiento por Municipio
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {statisticalAnalysis.municipioResults.slice(0, 10).map((municipio, index) => (
                                    <div key={municipio.municipio} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium">{municipio.municipio}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {municipio.sectionsWon} de {municipio.totalSections} secciones ganadas
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold">{municipio.winPercentage.toFixed(1)}%</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {municipio.totalVotes.toLocaleString()} votos
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-2">
                                            <div
                                                className="h-2 rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${Math.min(municipio.winPercentage, 100)}%`,
                                                    backgroundColor: selectedPartyColor
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="comparison" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Análisis de Márgenes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                                        <div>
                                            <div className="font-medium text-green-800">Margen Promedio de Victoria</div>
                                            <div className="text-sm text-green-600">Cuando gana {selectedParty}</div>
                                        </div>
                                        <div className="text-2xl font-bold text-green-800">
                                            {statisticalAnalysis.avgVictoryMargin.toFixed(1)}%
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                                        <div>
                                            <div className="font-medium text-red-800">Margen Promedio de Derrota</div>
                                            <div className="text-sm text-red-600">Cuando pierde {selectedParty}</div>
                                        </div>
                                        <div className="text-2xl font-bold text-red-800">
                                            {statisticalAnalysis.avgDefeatMargin.toFixed(1)}%
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Distribución de Resultados</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium">Secciones Ganadas</span>
                                            <span className="text-sm text-muted-foreground">
                                                {statisticalAnalysis.sectionsWon} ({statisticalAnalysis.winPercentage.toFixed(1)}%)
                                            </span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-3">
                                            <div
                                                className="h-3 rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${Math.min(statisticalAnalysis.winPercentage, 100)}%`,
                                                    backgroundColor: selectedPartyColor
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium">Participación en Votos</span>
                                            <span className="text-sm text-muted-foreground">
                                                {statisticalAnalysis.voteSharePercentage.toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-3">
                                            <div
                                                className="h-3 rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${Math.min(statisticalAnalysis.voteSharePercentage, 100)}%`,
                                                    backgroundColor: selectedPartyColor
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t">
                                        <div className="text-sm text-muted-foreground">
                                            <p><strong>Total de votos:</strong> {statisticalAnalysis.totalVotesForParty.toLocaleString()}</p>
                                            <p><strong>Promedio por sección:</strong> {Math.round(statisticalAnalysis.totalVotesForParty / statisticalAnalysis.totalSections).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

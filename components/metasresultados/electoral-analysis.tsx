"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, Trophy, Target, BarChart3 } from "lucide-react"

interface ElectoralAnalysisProps {
    data: any[]
}

// Partidos mexicanos principales
const MEXICAN_PARTIES = [
    "PAN",
    "PRI",
    "PRD",
    "MORENA",
    "MC",
    "PT",
    "PVEM",
    "PAN-PRI-PRD",
    "PAN-PRI",
    "PAN-PRD",
    "PRI-PRD",
    "PVEM-PT-MORENA",
    "PVEM-MORENA",
    "PT-MORENA",
    "PVEM_PT",
    "NO_REGISTRADAS",
    "NULOS",
]

// Colores oficiales
const PARTY_COLORS: Record<string, string> = {
    PAN: "#0066CC",
    PRI: "#FF0000",
    PRD: "#FFFF00",
    MORENA: "#8B4513",
    MC: "#FF6600",
    PT: "#CC0000",
    PVEM: "#00AA00",
    NO_REGISTRADAS: "#C0C0C0",
    NULOS: "#808080",
}

export function ElectoralAnalysis({ data }: ElectoralAnalysisProps) {
    const [selectedParty, setSelectedParty] = useState("")

    // Análisis general
    const generalAnalysis = useMemo(() => {
        if (!data || data.length === 0) return null

        const partidoTotales: Record<string, number> = {}
        let totalVotos = 0

        MEXICAN_PARTIES.forEach((party) => {
            partidoTotales[party] = 0
        })

        data.forEach((row) => {
            MEXICAN_PARTIES.forEach((party) => {
                const votos = Number(row[party]) || 0
                partidoTotales[party] += votos
                totalVotos += votos
            })
        })

        const partidos = MEXICAN_PARTIES.map((party) => ({
            nombre: party,
            votos: partidoTotales[party],
            porcentaje: totalVotos > 0 ? (partidoTotales[party] / totalVotos) * 100 : 0,
            color: PARTY_COLORS[party] || "#8884d8",
        }))
            .filter((p) => p.votos > 0)
            .sort((a, b) => b.votos - a.votos)

        const primero = partidos[0]
        const segundo = partidos[1]
        const margenVictoria = primero && segundo ? primero.porcentaje - segundo.porcentaje : 0

        return {
            partidos,
            primero,
            segundo,
            margenVictoria,
            totalVotos,
        }
    }, [data])

    // Análisis por partido seleccionado
    const partyAnalysis = useMemo(() => {
        if (!data || data.length === 0 || !selectedParty) return null

        const seccionesAnalysis = data.map((row) => {
            const partidoVotos = Number(row[selectedParty]) || 0
            const totalSeccion = MEXICAN_PARTIES.reduce((sum, party) => sum + (Number(row[party]) || 0), 0)

            // Calcular ganador de la sección
            const resultados = MEXICAN_PARTIES.map((party) => ({
                party,
                votos: Number(row[party]) || 0,
            })).sort((a, b) => b.votos - a.votos)

            const ganador = resultados[0]
            const isWin = ganador.party === selectedParty

            return {
                seccion: row.SECCION,
                municipio: row.MUNICIPIO,
                partidoVotos,
                totalSeccion,
                porcentaje: totalSeccion > 0 ? (partidoVotos / totalSeccion) * 100 : 0,
                isWin,
                ganador: ganador.party,
            }
        })

        const seccionesGanadas = seccionesAnalysis.filter((s) => s.isWin).length
        const seccionesPerdidas = seccionesAnalysis.length - seccionesGanadas
        const porcentajeVictorias = seccionesAnalysis.length > 0 ? (seccionesGanadas / seccionesAnalysis.length) * 100 : 0

        const mejoresSecciones = seccionesAnalysis.sort((a, b) => b.partidoVotos - a.partidoVotos).slice(0, 10)

        const peoresSecciones = seccionesAnalysis
            .filter((s) => s.partidoVotos > 0)
            .sort((a, b) => a.partidoVotos - b.partidoVotos)
            .slice(0, 10)

        return {
            seccionesGanadas,
            seccionesPerdidas,
            porcentajeVictorias,
            mejoresSecciones,
            peoresSecciones,
            totalVotos: seccionesAnalysis.reduce((sum, s) => sum + s.partidoVotos, 0),
        }
    }, [data, selectedParty])

    if (!generalAnalysis) {
        return (
            <Card>
                <CardContent className="p-8 text-center">
                    <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No hay datos para análisis</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Análisis general */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Análisis General
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Dos primeros lugares */}
                        <div className="space-y-4">
                            <h3 className="font-semibold">Dos Primeros Lugares</h3>

                            {generalAnalysis.primero && (
                                <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Trophy className="h-5 w-5 text-yellow-600" />
                                        <span className="font-semibold">Primer Lugar</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 rounded" style={{ backgroundColor: generalAnalysis.primero.color }} />
                                        <div>
                                            <div className="font-bold">{generalAnalysis.primero.nombre}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {generalAnalysis.primero.votos.toLocaleString()} votos (
                                                {generalAnalysis.primero.porcentaje.toFixed(2)}%)
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {generalAnalysis.segundo && (
                                <div className="p-4 border rounded-lg bg-gray-50 border-gray-200">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center">
                                            <span className="text-xs font-bold text-white">2</span>
                                        </div>
                                        <span className="font-semibold">Segundo Lugar</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 rounded" style={{ backgroundColor: generalAnalysis.segundo.color }} />
                                        <div>
                                            <div className="font-bold">{generalAnalysis.segundo.nombre}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {generalAnalysis.segundo.votos.toLocaleString()} votos (
                                                {generalAnalysis.segundo.porcentaje.toFixed(2)}%)
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {generalAnalysis.primero && generalAnalysis.segundo && (
                                <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                                    <h4 className="font-semibold mb-2">Diferencia</h4>
                                    <div className="text-2xl font-bold text-blue-700">{generalAnalysis.margenVictoria.toFixed(2)}%</div>
                                    <div className="text-sm text-blue-600">
                                        {(generalAnalysis.primero.votos - generalAnalysis.segundo.votos).toLocaleString()} votos
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Competitividad */}
                        <div className="space-y-4">
                            <h3 className="font-semibold">Análisis de Competitividad</h3>

                            <div className="space-y-3">
                                <div className="p-3 border rounded">
                                    <div className="font-medium">Margen de Victoria</div>
                                    <div className="text-2xl font-bold">{generalAnalysis.margenVictoria.toFixed(1)}%</div>
                                    <div className="text-sm text-muted-foreground">
                                        {generalAnalysis.margenVictoria < 5
                                            ? "Muy competitivo"
                                            : generalAnalysis.margenVictoria < 10
                                                ? "Competitivo"
                                                : generalAnalysis.margenVictoria < 20
                                                    ? "Moderadamente competitivo"
                                                    : "No competitivo"}
                                    </div>
                                </div>

                                <div className="p-3 border rounded">
                                    <div className="font-medium">Total de Partidos</div>
                                    <div className="text-2xl font-bold">{generalAnalysis.partidos.length}</div>
                                    <div className="text-sm text-muted-foreground">Con votos registrados</div>
                                </div>

                                <div className="p-3 border rounded">
                                    <div className="font-medium">Concentración</div>
                                    <div className="text-2xl font-bold">
                                        {generalAnalysis.primero
                                            ? (generalAnalysis.primero.porcentaje + (generalAnalysis.segundo?.porcentaje || 0)).toFixed(1)
                                            : 0}
                                        %
                                    </div>
                                    <div className="text-sm text-muted-foreground">Dos primeros lugares</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Análisis por partido */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Análisis por Partido
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Seleccionar partido para análisis detallado:</label>
                            <Select value={selectedParty} onValueChange={setSelectedParty}>
                                <SelectTrigger className="w-full max-w-md">
                                    <SelectValue placeholder="Seleccionar partido" />
                                </SelectTrigger>
                                <SelectContent>
                                    {generalAnalysis.partidos.map((partido) => (
                                        <SelectItem key={partido.nombre} value={partido.nombre}>
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded" style={{ backgroundColor: partido.color }} />
                                                {partido.nombre} - {partido.porcentaje.toFixed(1)}%
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {partyAnalysis && (
                            <Tabs defaultValue="performance" className="space-y-4">
                                <TabsList>
                                    <TabsTrigger value="performance">Rendimiento</TabsTrigger>
                                    <TabsTrigger value="sections">Secciones</TabsTrigger>
                                </TabsList>

                                <TabsContent value="performance" className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <Card>
                                            <CardContent className="p-4">
                                                <div className="text-2xl font-bold text-green-600">{partyAnalysis.seccionesGanadas}</div>
                                                <div className="text-sm text-muted-foreground">Secciones Ganadas</div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardContent className="p-4">
                                                <div className="text-2xl font-bold text-red-600">{partyAnalysis.seccionesPerdidas}</div>
                                                <div className="text-sm text-muted-foreground">Secciones Perdidas</div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardContent className="p-4">
                                                <div className="text-2xl font-bold text-blue-600">
                                                    {partyAnalysis.porcentajeVictorias.toFixed(1)}%
                                                </div>
                                                <div className="text-sm text-muted-foreground">Tasa de Victoria</div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardContent className="p-4">
                                                <div className="text-2xl font-bold text-purple-600">
                                                    {partyAnalysis.totalVotos.toLocaleString()}
                                                </div>
                                                <div className="text-sm text-muted-foreground">Total de Votos</div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>

                                <TabsContent value="sections" className="space-y-4">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Mejores secciones */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-lg">Top 10 Mejores Secciones</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-3">
                                                    {partyAnalysis.mejoresSecciones.map((seccion, index) => (
                                                        <div
                                                            key={seccion.seccion}
                                                            className="flex items-center justify-between p-3 bg-muted/30 rounded"
                                                        >
                                                            <div>
                                                                <div className="font-medium">Sección {seccion.seccion}</div>
                                                                <div className="text-sm text-muted-foreground">{seccion.municipio}</div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="font-bold">{seccion.partidoVotos.toLocaleString()}</div>
                                                                <Badge variant={seccion.isWin ? "default" : "secondary"}>
                                                                    {seccion.isWin ? "Ganó" : "Perdió"}
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
                                                <CardTitle className="text-lg">Secciones con Menor Rendimiento</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-3">
                                                    {partyAnalysis.peoresSecciones.map((seccion, index) => (
                                                        <div
                                                            key={seccion.seccion}
                                                            className="flex items-center justify-between p-3 bg-muted/30 rounded"
                                                        >
                                                            <div>
                                                                <div className="font-medium">Sección {seccion.seccion}</div>
                                                                <div className="text-sm text-muted-foreground">{seccion.municipio}</div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="font-bold">{seccion.partidoVotos.toLocaleString()}</div>
                                                                <Badge variant={seccion.isWin ? "default" : "secondary"}>
                                                                    {seccion.isWin ? "Ganó" : "Perdió"}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

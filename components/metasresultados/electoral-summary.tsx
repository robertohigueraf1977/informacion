"use client"

import type React from "react"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Users, Vote, TrendingUp, BarChart3 } from "lucide-react"

interface ElectoralSummaryProps {
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

// Colores oficiales de partidos
const PARTY_COLORS: Record<string, string> = {
    PAN: "#0066CC",
    PRI: "#FF0000",
    PRD: "#FFFF00",
    MORENA: "#8B4513",
    MC: "#FF6600",
    PT: "#CC0000",
    PVEM: "#00AA00",
    "PAN-PRI-PRD": "#6666CC",
    "PAN-PRI": "#8033CC",
    "PAN-PRD": "#80CC33",
    "PRI-PRD": "#FF8000",
    "PVEM-PT-MORENA": "#4D7A4D",
    "PVEM-MORENA": "#5D8A5D",
    "PT-MORENA": "#A0522D",
    PVEM_PT: "#66AA66",
    NO_REGISTRADAS: "#C0C0C0",
    NULOS: "#808080",
}

const PARTY_NAMES: Record<string, string> = {
    PAN: "Partido Acción Nacional",
    PRI: "Partido Revolucionario Institucional",
    PRD: "Partido de la Revolución Democrática",
    MORENA: "Movimiento Regeneración Nacional",
    MC: "Movimiento Ciudadano",
    PT: "Partido del Trabajo",
    PVEM: "Partido Verde Ecologista de México",
    NO_REGISTRADAS: "Candidaturas No Registradas",
    NULOS: "Votos Nulos",
}

export function ElectoralSummary({ data }: ElectoralSummaryProps) {
    const summary = useMemo(() => {
        if (!data || data.length === 0) {
            return {
                totalVotos: 0,
                totalListaNominal: 0,
                participacion: 0,
                totalSecciones: 0,
                partidos: [],
                ganador: null,
                segundo: null,
                tercero: null,
            }
        }

        // Calcular totales
        let totalVotos = 0
        let totalListaNominal = 0
        const partidoTotales: Record<string, number> = {}

        // Inicializar contadores
        MEXICAN_PARTIES.forEach((party) => {
            partidoTotales[party] = 0
        })

        // Procesar cada fila
        data.forEach((row) => {
            const listaNominal = Number(row.LISTA_NOMINAL) || 0
            totalListaNominal += listaNominal

            MEXICAN_PARTIES.forEach((party) => {
                const votos = Number(row[party]) || 0
                partidoTotales[party] += votos
                totalVotos += votos
            })
        })

        // Calcular participación
        const participacion = totalListaNominal > 0 ? (totalVotos / totalListaNominal) * 100 : 0

        // Crear array de partidos con resultados
        const partidos = MEXICAN_PARTIES.map((party) => ({
            nombre: party,
            nombreCompleto: PARTY_NAMES[party] || party,
            votos: partidoTotales[party],
            porcentaje: totalVotos > 0 ? (partidoTotales[party] / totalVotos) * 100 : 0,
            color: PARTY_COLORS[party] || "#8884d8",
        }))
            .filter((partido) => partido.votos > 0)
            .sort((a, b) => b.votos - a.votos)

        return {
            totalVotos,
            totalListaNominal,
            participacion,
            totalSecciones: data.length,
            partidos,
            ganador: partidos[0] || null,
            segundo: partidos[1] || null,
            tercero: partidos[2] || null,
        }
    }, [data])

    if (summary.totalSecciones === 0) {
        return (
            <Card>
                <CardContent className="p-8 text-center">
                    <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No hay datos para mostrar</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <Vote className="h-8 w-8 text-blue-600" />
                            <div>
                                <div className="text-2xl font-bold">{summary.totalVotos.toLocaleString()}</div>
                                <div className="text-sm text-muted-foreground">Total de Votos</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <Users className="h-8 w-8 text-green-600" />
                            <div>
                                <div className="text-2xl font-bold">{summary.totalListaNominal.toLocaleString()}</div>
                                <div className="text-sm text-muted-foreground">Lista Nominal</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <TrendingUp className="h-8 w-8 text-purple-600" />
                            <div>
                                <div className="text-2xl font-bold">{summary.participacion.toFixed(1)}%</div>
                                <div className="text-sm text-muted-foreground">Participación</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <BarChart3 className="h-8 w-8 text-orange-600" />
                            <div>
                                <div className="text-2xl font-bold">{summary.totalSecciones.toLocaleString()}</div>
                                <div className="text-sm text-muted-foreground">Secciones</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Podio de resultados */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5" />
                        Resultados Principales
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Primer lugar */}
                        {summary.ganador && (
                            <div className="text-center p-6 border rounded-lg bg-gradient-to-b from-yellow-50 to-yellow-100 border-yellow-200">
                                <Trophy className="h-12 w-12 mx-auto text-yellow-600 mb-4" />
                                <h3 className="text-xl font-bold mb-2">{summary.ganador.nombre}</h3>
                                <p className="text-sm text-muted-foreground mb-4">{summary.ganador.nombreCompleto}</p>
                                <div className="text-3xl font-bold mb-2">{summary.ganador.votos.toLocaleString()}</div>
                                <div className="text-lg font-semibold text-yellow-700">{summary.ganador.porcentaje.toFixed(2)}%</div>
                                <Badge className="mt-4" style={{ backgroundColor: summary.ganador.color, color: "white" }}>
                                    1° Lugar
                                </Badge>
                            </div>
                        )}

                        {/* Segundo lugar */}
                        {summary.segundo && (
                            <div className="text-center p-6 border rounded-lg bg-gradient-to-b from-gray-50 to-gray-100 border-gray-200">
                                <div className="w-12 h-12 mx-auto mb-4 bg-gray-300 rounded-full flex items-center justify-center">
                                    <span className="text-xl font-bold text-gray-600">2</span>
                                </div>
                                <h3 className="text-xl font-bold mb-2">{summary.segundo.nombre}</h3>
                                <p className="text-sm text-muted-foreground mb-4">{summary.segundo.nombreCompleto}</p>
                                <div className="text-2xl font-bold mb-2">{summary.segundo.votos.toLocaleString()}</div>
                                <div className="text-lg font-semibold text-gray-700">{summary.segundo.porcentaje.toFixed(2)}%</div>
                                <Badge className="mt-4" style={{ backgroundColor: summary.segundo.color, color: "white" }}>
                                    2° Lugar
                                </Badge>
                            </div>
                        )}

                        {/* Tercer lugar */}
                        {summary.tercero && (
                            <div className="text-center p-6 border rounded-lg bg-gradient-to-b from-orange-50 to-orange-100 border-orange-200">
                                <div className="w-12 h-12 mx-auto mb-4 bg-orange-300 rounded-full flex items-center justify-center">
                                    <span className="text-xl font-bold text-orange-600">3</span>
                                </div>
                                <h3 className="text-xl font-bold mb-2">{summary.tercero.nombre}</h3>
                                <p className="text-sm text-muted-foreground mb-4">{summary.tercero.nombreCompleto}</p>
                                <div className="text-2xl font-bold mb-2">{summary.tercero.votos.toLocaleString()}</div>
                                <div className="text-lg font-semibold text-orange-700">{summary.tercero.porcentaje.toFixed(2)}%</div>
                                <Badge className="mt-4" style={{ backgroundColor: summary.tercero.color, color: "white" }}>
                                    3° Lugar
                                </Badge>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Ranking completo */}
            <Card>
                <CardHeader>
                    <CardTitle>Ranking Completo de Partidos</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {summary.partidos.map((partido, index) => (
                            <div key={partido.nombre} className="flex items-center gap-4 p-4 border rounded-lg">
                                <Badge variant={index < 3 ? "default" : "secondary"}>#{index + 1}</Badge>

                                <div
                                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                                    style={{ backgroundColor: partido.color }}
                                />

                                <div className="flex-1">
                                    <div className="font-semibold">{partido.nombre}</div>
                                    <div className="text-sm text-muted-foreground">{partido.nombreCompleto}</div>
                                </div>

                                <div className="text-right">
                                    <div className="font-bold text-lg">{partido.votos.toLocaleString()}</div>
                                    <div className="text-sm text-muted-foreground">{partido.porcentaje.toFixed(2)}%</div>
                                </div>

                                <div className="w-32">
                                    <Progress
                                        value={partido.porcentaje}
                                        className="h-2"
                                        style={
                                            {
                                                "--progress-background": partido.color,
                                            } as React.CSSProperties
                                        }
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

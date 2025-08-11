"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Target, TrendingUp, Users, Vote, Plus, Trash2 } from "lucide-react"

interface ElectoralGoalsProps {
    data: any[]
}

interface Goal {
    id: string
    party: string
    type: "votes" | "percentage" | "sections"
    target: number
    current: number
    description: string
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
}

export function ElectoralGoals({ data }: ElectoralGoalsProps) {
    const [goals, setGoals] = useState<Goal[]>([])
    const [newGoal, setNewGoal] = useState({
        party: "",
        type: "votes" as "votes" | "percentage" | "sections",
        target: "",
        description: "",
    })

    // Calcular estadísticas actuales
    const currentStats = useMemo(() => {
        if (!data || data.length === 0) return {}

        const partidoTotales: Record<string, number> = {}
        const seccionesGanadas: Record<string, number> = {}
        let totalVotos = 0

        // Inicializar contadores
        MEXICAN_PARTIES.forEach((party) => {
            partidoTotales[party] = 0
            seccionesGanadas[party] = 0
        })

        // Procesar datos
        data.forEach((row) => {
            let maxVotos = 0
            let ganador = ""

            MEXICAN_PARTIES.forEach((party) => {
                const votos = Number(row[party]) || 0
                partidoTotales[party] += votos
                totalVotos += votos

                if (votos > maxVotos) {
                    maxVotos = votos
                    ganador = party
                }
            })

            if (ganador) {
                seccionesGanadas[ganador]++
            }
        })

        // Calcular porcentajes
        const partidoPorcentajes: Record<string, number> = {}
        MEXICAN_PARTIES.forEach((party) => {
            partidoPorcentajes[party] = totalVotos > 0 ? (partidoTotales[party] / totalVotos) * 100 : 0
        })

        return {
            votos: partidoTotales,
            porcentajes: partidoPorcentajes,
            secciones: seccionesGanadas,
            totalVotos,
            totalSecciones: data.length,
        }
    }, [data])

    const addGoal = () => {
        if (!newGoal.party || !newGoal.target || !newGoal.description) return

        const current = getCurrentValue(newGoal.party, newGoal.type)

        const goal: Goal = {
            id: Date.now().toString(),
            party: newGoal.party,
            type: newGoal.type,
            target: Number(newGoal.target),
            current,
            description: newGoal.description,
        }

        setGoals([...goals, goal])
        setNewGoal({ party: "", type: "votes", target: "", description: "" })
    }

    const removeGoal = (id: string) => {
        setGoals(goals.filter((goal) => goal.id !== id))
    }

    const getCurrentValue = (party: string, type: string): number => {
        if (!currentStats.votos) return 0

        switch (type) {
            case "votes":
                return currentStats.votos[party] || 0
            case "percentage":
                return currentStats.porcentajes[party] || 0
            case "sections":
                return currentStats.secciones[party] || 0
            default:
                return 0
        }
    }

    const getGoalProgress = (goal: Goal): number => {
        if (goal.target === 0) return 0
        return Math.min((goal.current / goal.target) * 100, 100)
    }

    const getGoalStatus = (goal: Goal): "achieved" | "on-track" | "behind" => {
        const progress = getGoalProgress(goal)
        if (progress >= 100) return "achieved"
        if (progress >= 75) return "on-track"
        return "behind"
    }

    const getTypeLabel = (type: string): string => {
        switch (type) {
            case "votes":
                return "Votos"
            case "percentage":
                return "Porcentaje"
            case "sections":
                return "Secciones"
            default:
                return type
        }
    }

    const formatValue = (value: number, type: string): string => {
        switch (type) {
            case "votes":
                return value.toLocaleString()
            case "percentage":
                return `${value.toFixed(1)}%`
            case "sections":
                return value.toString()
            default:
                return value.toString()
        }
    }

    if (!currentStats.votos) {
        return (
            <Card>
                <CardContent className="p-8 text-center">
                    <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No hay datos para establecer metas</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Resumen de rendimiento actual */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Rendimiento Actual
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 border rounded-lg">
                            <Vote className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                            <div className="text-2xl font-bold">{currentStats.totalVotos.toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">Total de Votos</div>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                            <Users className="h-8 w-8 mx-auto text-green-600 mb-2" />
                            <div className="text-2xl font-bold">{currentStats.totalSecciones}</div>
                            <div className="text-sm text-muted-foreground">Secciones Analizadas</div>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                            <Target className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                            <div className="text-2xl font-bold">{goals.length}</div>
                            <div className="text-sm text-muted-foreground">Metas Establecidas</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Formulario para nueva meta */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Establecer Nueva Meta
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div>
                            <Label htmlFor="party">Partido</Label>
                            <Select value={newGoal.party} onValueChange={(value) => setNewGoal({ ...newGoal, party: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                                <SelectContent>
                                    {MEXICAN_PARTIES.filter((party) => currentStats.votos[party] > 0).map((party) => (
                                        <SelectItem key={party} value={party}>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded"
                                                    style={{ backgroundColor: PARTY_COLORS[party] || "#808080" }}
                                                />
                                                {party}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="type">Tipo de Meta</Label>
                            <Select value={newGoal.type} onValueChange={(value: any) => setNewGoal({ ...newGoal, type: value })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="votes">Votos</SelectItem>
                                    <SelectItem value="percentage">Porcentaje</SelectItem>
                                    <SelectItem value="sections">Secciones Ganadas</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="target">Objetivo</Label>
                            <Input
                                id="target"
                                type="number"
                                placeholder="Ej: 50000"
                                value={newGoal.target}
                                onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                            />
                        </div>

                        <div>
                            <Label htmlFor="description">Descripción</Label>
                            <Input
                                id="description"
                                placeholder="Descripción de la meta"
                                value={newGoal.description}
                                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                            />
                        </div>

                        <div className="flex items-end">
                            <Button onClick={addGoal} className="w-full">
                                <Plus className="h-4 w-4 mr-2" />
                                Agregar Meta
                            </Button>
                        </div>
                    </div>

                    {newGoal.party && (
                        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                            <div className="text-sm">
                                <strong>Valor actual de {newGoal.party}:</strong>{" "}
                                {formatValue(getCurrentValue(newGoal.party, newGoal.type), newGoal.type)}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Lista de metas */}
            {goals.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5" />
                            Metas Establecidas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {goals.map((goal) => {
                                const progress = getGoalProgress(goal)
                                const status = getGoalStatus(goal)
                                const currentValue = getCurrentValue(goal.party, goal.type)

                                return (
                                    <div key={goal.id} className="p-4 border rounded-lg">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-4 h-4 rounded"
                                                    style={{ backgroundColor: PARTY_COLORS[goal.party] || "#808080" }}
                                                />
                                                <div>
                                                    <div className="font-semibold">
                                                        {goal.party} - {getTypeLabel(goal.type)}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">{goal.description}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant={
                                                        status === "achieved" ? "default" : status === "on-track" ? "secondary" : "destructive"
                                                    }
                                                >
                                                    {status === "achieved" ? "Lograda" : status === "on-track" ? "En camino" : "Rezagada"}
                                                </Badge>
                                                <Button onClick={() => removeGoal(goal.id)} variant="ghost" size="sm">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>
                                                    Progreso: {formatValue(currentValue, goal.type)} / {formatValue(goal.target, goal.type)}
                                                </span>
                                                <span>{progress.toFixed(1)}%</span>
                                            </div>
                                            <Progress value={progress} className="h-2" />
                                        </div>

                                        {status === "behind" && (
                                            <div className="mt-2 text-sm text-red-600">
                                                Faltan {formatValue(goal.target - currentValue, goal.type)} para alcanzar la meta
                                            </div>
                                        )}
                                        {status === "achieved" && (
                                            <div className="mt-2 text-sm text-green-600">
                                                ¡Meta alcanzada! Superado por {formatValue(currentValue - goal.target, goal.type)}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Sugerencias de metas */}
            <Card>
                <CardHeader>
                    <CardTitle>Sugerencias de Metas</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(currentStats.votos)
                            .sort(([, a], [, b]) => b - a)
                            .slice(0, 4)
                            .map(([party, votes]) => {
                                const percentage = currentStats.porcentajes[party]
                                const sections = currentStats.secciones[party]

                                return (
                                    <div key={party} className="p-4 border rounded-lg">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-4 h-4 rounded" style={{ backgroundColor: PARTY_COLORS[party] || "#808080" }} />
                                            <span className="font-semibold">{party}</span>
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            <div>
                                                <strong>Actual:</strong> {votes.toLocaleString()} votos ({percentage.toFixed(1)}%)
                                            </div>
                                            <div>
                                                <strong>Secciones ganadas:</strong> {sections}
                                            </div>
                                            <div className="text-muted-foreground">
                                                <strong>Metas sugeridas:</strong>
                                                <ul className="mt-1 space-y-1">
                                                    <li>• {Math.round(votes * 1.1).toLocaleString()} votos (+10%)</li>
                                                    <li>• {(percentage * 1.05).toFixed(1)}% del total (+5%)</li>
                                                    <li>• {sections + Math.ceil(sections * 0.2)} secciones (+20%)</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

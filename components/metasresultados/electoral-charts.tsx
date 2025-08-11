"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, BarChart3, TrendingUp } from "lucide-react"

interface ElectoralChartsProps {
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
    "PAN-PRI-PRD": "#6666CC",
    NO_REGISTRADAS: "#C0C0C0",
    NULOS: "#808080",
}

export function ElectoralCharts({ data }: ElectoralChartsProps) {
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return []

        const partidoTotales: Record<string, number> = {}
        let totalVotos = 0

        // Inicializar contadores
        MEXICAN_PARTIES.forEach((party) => {
            partidoTotales[party] = 0
        })

        // Sumar votos por partido
        data.forEach((row) => {
            MEXICAN_PARTIES.forEach((party) => {
                const votos = Number(row[party]) || 0
                partidoTotales[party] += votos
                totalVotos += votos
            })
        })

        // Crear datos para gráficos
        return MEXICAN_PARTIES.map((party) => ({
            partido: party,
            votos: partidoTotales[party],
            porcentaje: totalVotos > 0 ? (partidoTotales[party] / totalVotos) * 100 : 0,
            color: PARTY_COLORS[party] || "#8884d8",
        }))
            .filter((item) => item.votos > 0)
            .sort((a, b) => b.votos - a.votos)
    }, [data])

    if (chartData.length === 0) {
        return (
            <Card>
                <CardContent className="p-8 text-center">
                    <PieChart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No hay datos para mostrar gráficos</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Gráfico de barras horizontal */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Resultados por Partido
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {chartData.slice(0, 10).map((item, index) => (
                            <div key={item.partido} className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium w-8">#{index + 1}</span>
                                        <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
                                        <span className="font-medium">{item.partido}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold">{item.votos.toLocaleString()}</div>
                                        <div className="text-sm text-muted-foreground">{item.porcentaje.toFixed(1)}%</div>
                                    </div>
                                </div>
                                <div className="w-full bg-muted rounded-full h-3">
                                    <div
                                        className="h-3 rounded-full transition-all duration-500"
                                        style={{
                                            width: `${Math.min(item.porcentaje, 100)}%`,
                                            backgroundColor: item.color,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Gráfico circular simulado */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <PieChart className="h-5 w-5" />
                        Distribución de Votos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Simulación de gráfico circular */}
                        <div className="relative">
                            <div className="w-64 h-64 mx-auto relative">
                                {/* Círculo base */}
                                <div className="w-full h-full rounded-full border-8 border-muted"></div>

                                {/* Segmentos principales */}
                                {chartData.slice(0, 5).map((item, index) => {
                                    const angle = (item.porcentaje / 100) * 360
                                    const rotation = chartData
                                        .slice(0, index)
                                        .reduce((sum, prev) => sum + (prev.porcentaje / 100) * 360, 0)

                                    return (
                                        <div
                                            key={item.partido}
                                            className="absolute inset-0 rounded-full"
                                            style={{
                                                background: `conic-gradient(from ${rotation}deg, ${item.color} 0deg, ${item.color} ${angle}deg, transparent ${angle}deg)`,
                                                mask: "radial-gradient(circle at center, transparent 40%, black 40%)",
                                            }}
                                        />
                                    )
                                })}

                                {/* Centro */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-24 h-24 bg-background rounded-full flex items-center justify-center border">
                                        <div className="text-center">
                                            <div className="text-sm font-bold">Total</div>
                                            <div className="text-xs text-muted-foreground">
                                                {chartData.reduce((sum, item) => sum + item.votos, 0).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Leyenda */}
                        <div className="space-y-3">
                            <h4 className="font-semibold">Leyenda</h4>
                            {chartData.slice(0, 8).map((item, index) => (
                                <div key={item.partido} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
                                        <span className="text-sm">{item.partido}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-medium">{item.porcentaje.toFixed(1)}%</div>
                                        <div className="text-xs text-muted-foreground">{item.votos.toLocaleString()}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Comparación de los principales */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Comparación de Principales Partidos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {chartData.slice(0, 3).map((item, index) => (
                            <div key={item.partido} className="p-6 border rounded-lg text-center" style={{ borderColor: item.color }}>
                                <div
                                    className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-white font-bold text-xl"
                                    style={{ backgroundColor: item.color }}
                                >
                                    {index + 1}
                                </div>
                                <h3 className="font-bold text-lg mb-2">{item.partido}</h3>
                                <div className="text-2xl font-bold mb-1">{item.votos.toLocaleString()}</div>
                                <div className="text-lg font-semibold" style={{ color: item.color }}>
                                    {item.porcentaje.toFixed(2)}%
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

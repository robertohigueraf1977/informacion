"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Map, MapPin, Info } from "lucide-react"

interface ElectoralMapProps {
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

interface SectionInfo {
    seccion: string
    municipio: string
    distrito: string
    ganador: string
    votosGanador: number
    totalVotos: number
    listaNominal: number
    partidos: Record<string, number>
    color: string
}

export function ElectoralMap({ data }: ElectoralMapProps) {
    const [selectedSection, setSelectedSection] = useState<SectionInfo | null>(null)
    const [viewMode, setViewMode] = useState<"winner" | "party">("winner")
    const [selectedParty, setSelectedParty] = useState("")

    // Procesar datos para el mapa
    const mapData = useMemo(() => {
        if (!data || data.length === 0) return []

        return data
            .map((row, index) => {
                const seccion = String(row.SECCION || index)
                const municipio = String(row.MUNICIPIO || "Sin municipio")
                const distrito = String(row.DISTRITO_LOCAL || row.DISTRITO_L || "Sin distrito")
                const listaNominal = Number(row.LISTA_NOMINAL) || 0

                // Calcular resultados por partido
                const partidos: Record<string, number> = {}
                let totalVotos = 0

                MEXICAN_PARTIES.forEach((party) => {
                    const votos = Number(row[party]) || 0
                    partidos[party] = votos
                    totalVotos += votos
                })

                // Encontrar ganador
                const partidosOrdenados = Object.entries(partidos).sort(([, a], [, b]) => b - a)

                const [ganador, votosGanador] = partidosOrdenados[0] || ["Sin datos", 0]
                const color = PARTY_COLORS[ganador] || "#808080"

                return {
                    seccion,
                    municipio,
                    distrito,
                    ganador,
                    votosGanador,
                    totalVotos,
                    listaNominal,
                    partidos,
                    color,
                    position: {
                        x: 50 + (index % 20) * 40,
                        y: 50 + Math.floor(index / 20) * 40,
                    },
                }
            })
            .slice(0, 100) // Limitar para rendimiento
    }, [data])

    // Estadísticas del mapa
    const mapStats = useMemo(() => {
        if (mapData.length === 0) return null

        const ganadorCount: Record<string, number> = {}
        let totalVotos = 0
        let totalListaNominal = 0

        mapData.forEach((section) => {
            ganadorCount[section.ganador] = (ganadorCount[section.ganador] || 0) + 1
            totalVotos += section.totalVotos
            totalListaNominal += section.listaNominal
        })

        const topPartidos = Object.entries(ganadorCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)

        return {
            totalSecciones: mapData.length,
            totalVotos,
            totalListaNominal,
            participacion: totalListaNominal > 0 ? (totalVotos / totalListaNominal) * 100 : 0,
            topPartidos,
        }
    }, [mapData])

    if (mapData.length === 0) {
        return (
            <Card>
                <CardContent className="p-8 text-center">
                    <Map className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No hay datos para mostrar en el mapa</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Controles */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Map className="h-5 w-5" />
                        Mapa Electoral por Secciones
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 mb-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Modo de visualización:</label>
                            <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                                <SelectTrigger className="w-48">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="winner">Por partido ganador</SelectItem>
                                    <SelectItem value="party">Por partido específico</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {viewMode === "party" && (
                            <div>
                                <label className="text-sm font-medium mb-2 block">Partido:</label>
                                <Select value={selectedParty} onValueChange={setSelectedParty}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Seleccionar partido" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {MEXICAN_PARTIES.filter((party) => mapData.some((section) => section.partidos[party] > 0)).map(
                                            (party) => (
                                                <SelectItem key={party} value={party}>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 rounded" style={{ backgroundColor: PARTY_COLORS[party] }} />
                                                        {party}
                                                    </div>
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    {/* Estadísticas */}
                    {mapStats && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="text-center p-3 bg-muted/30 rounded">
                                <div className="font-bold text-lg">{mapStats.totalSecciones}</div>
                                <div className="text-sm text-muted-foreground">Secciones</div>
                            </div>
                            <div className="text-center p-3 bg-muted/30 rounded">
                                <div className="font-bold text-lg">{mapStats.totalVotos.toLocaleString()}</div>
                                <div className="text-sm text-muted-foreground">Total Votos</div>
                            </div>
                            <div className="text-center p-3 bg-muted/30 rounded">
                                <div className="font-bold text-lg">{mapStats.participacion.toFixed(1)}%</div>
                                <div className="text-sm text-muted-foreground">Participación</div>
                            </div>
                            <div className="text-center p-3 bg-muted/30 rounded">
                                <div className="font-bold text-lg">{mapStats.topPartidos[0]?.[0] || "N/A"}</div>
                                <div className="text-sm text-muted-foreground">Líder</div>
                            </div>
                        </div>
                    )}

                    {/* Mapa */}
                    <div className="relative h-96 bg-slate-50 rounded-lg border overflow-hidden">
                        <svg width="100%" height="100%" viewBox="0 0 800 400">
                            {mapData.map((section, index) => {
                                let fillColor = section.color

                                if (viewMode === "party" && selectedParty) {
                                    const partyVotes = section.partidos[selectedParty] || 0
                                    const maxVotes = Math.max(...Object.values(section.partidos))
                                    const opacity = maxVotes > 0 ? partyVotes / maxVotes : 0
                                    fillColor = `${PARTY_COLORS[selectedParty] || "#808080"}${Math.round(opacity * 255)
                                        .toString(16)
                                        .padStart(2, "0")}`
                                }

                                return (
                                    <circle
                                        key={section.seccion}
                                        cx={section.position.x}
                                        cy={section.position.y}
                                        r={Math.max(8, Math.min(20, section.votosGanador / 100))}
                                        fill={fillColor}
                                        stroke="white"
                                        strokeWidth="2"
                                        className="cursor-pointer hover:stroke-black transition-all"
                                        onClick={() => setSelectedSection(section)}
                                    />
                                )
                            })}
                        </svg>

                        {/* Leyenda */}
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm max-w-xs">
                            <h4 className="font-medium text-sm mb-2">Leyenda</h4>
                            {viewMode === "winner" && mapStats && (
                                <div className="space-y-1">
                                    {mapStats.topPartidos.slice(0, 5).map(([party, count]) => (
                                        <div key={party} className="flex items-center gap-2 text-xs">
                                            <div className="w-3 h-3 rounded" style={{ backgroundColor: PARTY_COLORS[party] || "#808080" }} />
                                            <span>
                                                {party}: {count}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {viewMode === "party" && selectedParty && (
                                <div className="text-xs">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-3 h-3 rounded" style={{ backgroundColor: PARTY_COLORS[selectedParty] }} />
                                        <span>{selectedParty}</span>
                                    </div>
                                    <p className="text-muted-foreground">Intensidad = votos relativos</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-4 text-sm text-muted-foreground text-center">
                        Haz clic en cualquier círculo para ver información detallada de la sección
                    </div>
                </CardContent>
            </Card>

            {/* Ranking de partidos */}
            {mapStats && (
                <Card>
                    <CardHeader>
                        <CardTitle>Ranking por Secciones Ganadas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {mapStats.topPartidos.map(([party, count], index) => (
                                <div key={party} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline">#{index + 1}</Badge>
                                        <div className="w-4 h-4 rounded" style={{ backgroundColor: PARTY_COLORS[party] || "#808080" }} />
                                        <span className="font-medium">{party}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold">{count} secciones</div>
                                        <div className="text-sm text-muted-foreground">
                                            {((count / mapStats.totalSecciones) * 100).toFixed(1)}%
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Modal de información de sección */}
            <Dialog open={!!selectedSection} onOpenChange={() => setSelectedSection(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Sección {selectedSection?.seccion}
                        </DialogTitle>
                    </DialogHeader>
                    {selectedSection && (
                        <div className="space-y-4">
                            {/* Información general */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Municipio:</span>
                                    <div className="font-medium">{selectedSection.municipio}</div>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Distrito:</span>
                                    <div className="font-medium">{selectedSection.distrito}</div>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Lista nominal:</span>
                                    <div className="font-medium">{selectedSection.listaNominal.toLocaleString()}</div>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Total votos:</span>
                                    <div className="font-medium">{selectedSection.totalVotos.toLocaleString()}</div>
                                </div>
                            </div>

                            {/* Ganador */}
                            <div className="p-3 bg-muted/30 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Info className="h-4 w-4" />
                                    <span className="font-medium">Partido Ganador</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded" style={{ backgroundColor: selectedSection.color }} />
                                    <div>
                                        <div className="font-bold">{selectedSection.ganador}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {selectedSection.votosGanador.toLocaleString()} votos (
                                            {((selectedSection.votosGanador / selectedSection.totalVotos) * 100).toFixed(1)}%)
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Resultados por partido */}
                            <div>
                                <h4 className="font-medium mb-2">Resultados por partido:</h4>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {Object.entries(selectedSection.partidos)
                                        .sort(([, a], [, b]) => b - a)
                                        .filter(([, votes]) => votes > 0)
                                        .map(([party, votes]) => (
                                            <div key={party} className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-3 h-3 rounded"
                                                        style={{ backgroundColor: PARTY_COLORS[party] || "#808080" }}
                                                    />
                                                    <span>{party}</span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-medium">{votes.toLocaleString()}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {selectedSection.totalVotos > 0
                                                            ? ((votes / selectedSection.totalVotos) * 100).toFixed(1)
                                                            : 0}
                                                        %
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>

                            {/* Participación */}
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="font-medium text-blue-800 mb-1">Participación Electoral</div>
                                <div className="text-2xl font-bold text-blue-800">
                                    {selectedSection.listaNominal > 0
                                        ? ((selectedSection.totalVotos / selectedSection.listaNominal) * 100).toFixed(1)
                                        : 0}
                                    %
                                </div>
                                <div className="text-sm text-blue-600">
                                    {selectedSection.totalVotos.toLocaleString()} de {selectedSection.listaNominal.toLocaleString()}{" "}
                                    votantes
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ElectoralFilters } from "./electoral-filters"
import { ElectoralSummary } from "./electoral-summary"
import { ElectoralCharts } from "./electoral-charts"
import { ElectoralAnalysis } from "./electoral-analysis"
import { ElectoralMap } from "./electoral-map"
import { ElectoralGoals } from "./electoral-goals"
import { BarChart3, PieChart, TrendingUp, Map, Target, Filter } from "lucide-react"

interface ElectoralDashboardProps {
    data: any[]
}

export function ElectoralDashboard({ data }: ElectoralDashboardProps) {
    const [selectedMunicipio, setSelectedMunicipio] = useState("todos")
    const [selectedDistritoLocal, setSelectedDistritoLocal] = useState("todos")
    const [selectedDistritoFederal, setSelectedDistritoFederal] = useState("todos")
    const [selectedSeccion, setSelectedSeccion] = useState("todos")

    // Filtrar datos según selecciones
    const filteredData = useMemo(() => {
        let filtered = [...data]

        if (selectedMunicipio !== "todos") {
            const sel = String(selectedMunicipio || "").toLowerCase()
            filtered = filtered.filter((row) => String(row.MUNICIPIO_NOMBRE ?? row.MUNICIPIO ?? "").toLowerCase() === sel)
        }

        if (selectedDistritoLocal !== "todos") {
            const sel = String(selectedDistritoLocal || "")
            filtered = filtered.filter((row) => String(row.DISTRITO_LOCAL || row.DISTRITO_L || "") === sel)
        }

        if (selectedDistritoFederal !== "todos") {
            const sel = String(selectedDistritoFederal || "")
            filtered = filtered.filter(
                (row) => String(row.DISTRITO_FEDERAL || row.DISTRITO_F || "") === sel,
            )
        }

        if (selectedSeccion !== "todos") {
            const sel = String(selectedSeccion || "")
            filtered = filtered.filter((row) => String(row.SECCION || "") === sel)
        }

        return filtered
    }, [data, selectedMunicipio, selectedDistritoLocal, selectedDistritoFederal, selectedSeccion])

    // Estadísticas generales
    const stats = useMemo(() => {
        const totalRecords = data.length
        const filteredRecords = filteredData.length

        const municipios = new Set(
            data.map((row) => row.MUNICIPIO_NOMBRE ?? row.MUNICIPIO).filter(Boolean),
        ).size
        const distritosLocales = new Set(data.map((row) => row.DISTRITO_LOCAL || row.DISTRITO_L).filter(Boolean)).size
        const distritosFederales = new Set(data.map((row) => row.DISTRITO_FEDERAL || row.DISTRITO_F).filter(Boolean)).size
        const secciones = new Set(data.map((row) => row.SECCION).filter(Boolean)).size

        return {
            totalRecords,
            filteredRecords,
            municipios,
            distritosLocales,
            distritosFederales,
            secciones,
        }
    }, [data, filteredData])

    const clearFilters = () => {
        setSelectedMunicipio("todos")
        setSelectedDistritoLocal("todos")
        setSelectedDistritoFederal("todos")
        setSelectedSeccion("todos")
    }

    return (
        <div className="space-y-6">
            {/* Estadísticas generales */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold">{stats.filteredRecords.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">de {stats.totalRecords.toLocaleString()} registros</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold">{stats.municipios}</div>
                        <div className="text-sm text-muted-foreground">Municipios</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold">{stats.distritosLocales}</div>
                        <div className="text-sm text-muted-foreground">Distritos Locales</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold">{stats.secciones}</div>
                        <div className="text-sm text-muted-foreground">Secciones</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filtros */}
            <ElectoralFilters
                data={data}
                selectedMunicipio={selectedMunicipio}
                selectedDistritoLocal={selectedDistritoLocal}
                selectedDistritoFederal={selectedDistritoFederal}
                selectedSeccion={selectedSeccion}
                onMunicipioChange={setSelectedMunicipio}
                onDistritoLocalChange={setSelectedDistritoLocal}
                onDistritoFederalChange={setSelectedDistritoFederal}
                onSeccionChange={setSelectedSeccion}
                onClearFilters={clearFilters}
            />

            {/* Contenido principal */}
            <Tabs defaultValue="summary" className="space-y-6">
                <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="summary" className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Resumen
                    </TabsTrigger>
                    <TabsTrigger value="charts" className="flex items-center gap-2">
                        <PieChart className="h-4 w-4" />
                        Gráficos
                    </TabsTrigger>
                    <TabsTrigger value="analysis" className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Análisis
                    </TabsTrigger>
                    <TabsTrigger value="map" className="flex items-center gap-2">
                        <Map className="h-4 w-4" />
                        Mapa
                    </TabsTrigger>
                    <TabsTrigger value="goals" className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Metas
                    </TabsTrigger>
                    <TabsTrigger value="filters" className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        Filtros
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="summary">
                    <ElectoralSummary data={filteredData} />
                </TabsContent>

                <TabsContent value="charts">
                    <ElectoralCharts data={filteredData} />
                </TabsContent>

                <TabsContent value="analysis">
                    <ElectoralAnalysis data={filteredData} />
                </TabsContent>

                <TabsContent value="map">
                    <ElectoralMap data={filteredData} />
                </TabsContent>

                <TabsContent value="goals">
                    <ElectoralGoals data={filteredData} />
                </TabsContent>

                <TabsContent value="filters">
                    <div className="text-center py-8">
                        <Filter className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Los filtros están disponibles en la parte superior de la página</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Filter, X, Building, MapPin, Hash, Globe } from "lucide-react"

interface ElectoralFiltersProps {
    data: any[]
    selectedMunicipio: string
    selectedDistritoLocal: string
    selectedDistritoFederal: string
    selectedSeccion: string
    onMunicipioChange: (value: string) => void
    onDistritoLocalChange: (value: string) => void
    onDistritoFederalChange: (value: string) => void
    onSeccionChange: (value: string) => void
    onClearFilters: () => void
}

export function ElectoralFilters({
    data,
    selectedMunicipio,
    selectedDistritoLocal,
    selectedDistritoFederal,
    selectedSeccion,
    onMunicipioChange,
    onDistritoLocalChange,
    onDistritoFederalChange,
    onSeccionChange,
    onClearFilters,
}: ElectoralFiltersProps) {
    // Obtener opciones disponibles con filtrado en cascada
    const filterOptions = useMemo(() => {
        if (!data || data.length === 0) {
            return {
                municipios: [],
                distritosLocales: [],
                distritosFederales: [],
                secciones: [],
            }
        }

        // Municipios (sin filtrar) - usar nombre si está disponible y normalizar a string
        const municipios = [...new Set(
            data
                .map((row) => String(row.MUNICIPIO_NOMBRE ?? row.MUNICIPIO ?? ""))
                .filter((v) => v && v.length > 0),
        )].sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }))

        // Filtrar datos para distritos según municipio seleccionado
        let dataForDistritos = data
        if (selectedMunicipio !== "todos") {
            const sel = String(selectedMunicipio || "").toLowerCase()
            dataForDistritos = data.filter(
                (row) => String(row.MUNICIPIO_NOMBRE ?? row.MUNICIPIO ?? "").toLowerCase() === sel,
            )
        }

        const distritosLocales = [
            ...new Set(dataForDistritos.map((row) => row.DISTRITO_LOCAL || row.DISTRITO_L).filter(Boolean)),
        ].sort((a, b) => Number(a) - Number(b))

        const distritosFederales = [
            ...new Set(dataForDistritos.map((row) => row.DISTRITO_FEDERAL || row.DISTRITO_F).filter(Boolean)),
        ].sort((a, b) => Number(a) - Number(b))

        // Filtrar datos para secciones según todos los filtros anteriores
        let dataForSecciones = dataForDistritos
        if (selectedDistritoLocal !== "todos") {
            dataForSecciones = dataForSecciones.filter(
                (row) => String(row.DISTRITO_LOCAL || row.DISTRITO_L || "") === selectedDistritoLocal,
            )
        }
        if (selectedDistritoFederal !== "todos") {
            dataForSecciones = dataForSecciones.filter(
                (row) => String(row.DISTRITO_FEDERAL || row.DISTRITO_F || "") === selectedDistritoFederal,
            )
        }

        const secciones = [...new Set(dataForSecciones.map((row) => row.SECCION).filter(Boolean))].sort(
            (a, b) => Number(a) - Number(b),
        )

        return {
            municipios,
            distritosLocales,
            distritosFederales,
            secciones,
        }
    }, [data, selectedMunicipio, selectedDistritoLocal, selectedDistritoFederal])

    const hasActiveFilters =
        selectedMunicipio !== "todos" ||
        selectedDistritoLocal !== "todos" ||
        selectedDistritoFederal !== "todos" ||
        selectedSeccion !== "todos"

    const handleMunicipioChange = (value: string) => {
        onMunicipioChange(value)
        // Resetear filtros dependientes
        if (value !== selectedMunicipio) {
            onDistritoLocalChange("todos")
            onDistritoFederalChange("todos")
            onSeccionChange("todos")
        }
    }

    const handleDistritoChange = (type: "local" | "federal", value: string) => {
        if (type === "local") {
            onDistritoLocalChange(value)
        } else {
            onDistritoFederalChange(value)
        }
        // Resetear sección cuando cambia cualquier distrito
        if (
            (type === "local" && value !== selectedDistritoLocal) ||
            (type === "federal" && value !== selectedDistritoFederal)
        ) {
            onSeccionChange("todos")
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filtros Geográficos
                    </div>
                    {hasActiveFilters && (
                        <Button onClick={onClearFilters} variant="outline" size="sm">
                            <X className="h-4 w-4 mr-2" />
                            Limpiar filtros
                        </Button>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Controles de filtro */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Municipio */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Building className="h-4 w-4" />
                                Municipio ({filterOptions.municipios.length})
                            </label>
                            <Select value={selectedMunicipio} onValueChange={handleMunicipioChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Todos los municipios" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todos">Todos los municipios</SelectItem>
                                    {filterOptions.municipios.map((municipio) => (
                                        <SelectItem key={String(municipio)} value={String(municipio)}>
                                            {municipio}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Distrito Local */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Distrito Local ({filterOptions.distritosLocales.length})
                            </label>
                            <Select
                                value={selectedDistritoLocal}
                                onValueChange={(value) => handleDistritoChange("local", value)}
                                disabled={filterOptions.distritosLocales.length === 0}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Todos los distritos locales" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todos">Todos los distritos locales</SelectItem>
                                    {filterOptions.distritosLocales.map((distrito) => (
                                        <SelectItem key={distrito} value={String(distrito)}>
                                            Distrito Local {distrito}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Distrito Federal */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Globe className="h-4 w-4" />
                                Distrito Federal ({filterOptions.distritosFederales.length})
                            </label>
                            <Select
                                value={selectedDistritoFederal}
                                onValueChange={(value) => handleDistritoChange("federal", value)}
                                disabled={filterOptions.distritosFederales.length === 0}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Todos los distritos federales" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todos">Todos los distritos federales</SelectItem>
                                    {filterOptions.distritosFederales.map((distrito) => (
                                        <SelectItem key={distrito} value={String(distrito)}>
                                            Distrito Federal {distrito}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Sección */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Hash className="h-4 w-4" />
                                Sección ({filterOptions.secciones.length})
                            </label>
                            <Select
                                value={selectedSeccion}
                                onValueChange={onSeccionChange}
                                disabled={filterOptions.secciones.length === 0}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Todas las secciones" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todos">Todas las secciones</SelectItem>
                                    {filterOptions.secciones.slice(0, 100).map((seccion) => (
                                        <SelectItem key={seccion} value={String(seccion)}>
                                            Sección {seccion}
                                        </SelectItem>
                                    ))}
                                    {filterOptions.secciones.length > 100 && (
                                        <SelectItem value="more" disabled>
                                            ... y {filterOptions.secciones.length - 100} más
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Filtros activos */}
                    {hasActiveFilters && (
                        <div className="flex flex-wrap gap-2">
                            {selectedMunicipio !== "todos" && (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                    <Building className="h-3 w-3" />
                                    {selectedMunicipio}
                                    <X
                                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                                        onClick={() => handleMunicipioChange("todos")}
                                    />
                                </Badge>
                            )}
                            {selectedDistritoLocal !== "todos" && (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    Distrito Local {selectedDistritoLocal}
                                    <X
                                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                                        onClick={() => handleDistritoChange("local", "todos")}
                                    />
                                </Badge>
                            )}
                            {selectedDistritoFederal !== "todos" && (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                    <Globe className="h-3 w-3" />
                                    Distrito Federal {selectedDistritoFederal}
                                    <X
                                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                                        onClick={() => handleDistritoChange("federal", "todos")}
                                    />
                                </Badge>
                            )}
                            {selectedSeccion !== "todos" && (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                    <Hash className="h-3 w-3" />
                                    Sección {selectedSeccion}
                                    <X
                                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                                        onClick={() => onSeccionChange("todos")}
                                    />
                                </Badge>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

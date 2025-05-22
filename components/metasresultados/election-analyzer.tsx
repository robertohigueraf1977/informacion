"use client"

import { useState, useMemo, useEffect } from "react"
import { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ElectoralResultsChart } from "@/components/metasresultados/electoral-results-chart"
import { ResultsSummary } from "@/components/metasresultados/results-summary"
import { CoalitionBuilder } from "@/components/metasresultados/coalition-builder"
import { GoalsAnalyzer } from "@/components/metasresultados/goals-analyzer"
import { CardSpotlight } from "@/components/ui/card-spotlight"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface ElectionAnalyzerProps {
  data: any[]
}

export function ElectionAnalyzer({ data }: ElectionAnalyzerProps) {
  const [selectedDistrict, setSelectedDistrict] = useState<string>("TODOS")
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>("TODOS")
  const [selectedSection, setSelectedSection] = useState<string>("TODOS")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCoalition, setSelectedCoalition] = useState<string | null>(null)
  const [seccionesData, setSeccionesData] = useState<Record<string, any>>({})
  const [loadingSeccionesData, setLoadingSeccionesData] = useState(false)

  // Cargar datos de secciones para complementar información faltante
  useEffect(() => {
    const loadSeccionesData = async () => {
      if (Object.keys(seccionesData).length > 0) return // Ya tenemos los datos

      setLoadingSeccionesData(true)
      try {
        const response = await fetch("/api/secciones")
        if (!response.ok) {
          throw new Error(`Error al cargar datos de secciones: ${response.status}`)
        }

        const data = await response.json()

        // Crear un mapa de secciones para acceso rápido
        const seccionesMap: Record<string, any> = {}

        if (Array.isArray(data)) {
          data.forEach((seccion) => {
            // Usar el número de sección como clave
            if (seccion.numero) {
              seccionesMap[seccion.numero.toString()] = {
                id: seccion.id,
                nombre: seccion.nombre || seccion.numero,
                distrito: seccion.distritoLocal?.nombre || "No especificado",
                distritoFederal: seccion.distritoFederal?.nombre || "No especificado",
                municipio: seccion.municipio?.nombre || "No especificado",
                sector: seccion.sector?.nombre || "No especificado",
              }
            }
          })
        }

        setSeccionesData(seccionesMap)
        console.log("Datos de secciones cargados:", Object.keys(seccionesMap).length)
      } catch (err) {
        console.error("Error al cargar datos de secciones:", err)
        setError("Error al cargar datos de secciones. Algunos datos podrían estar incompletos.")
      } finally {
        setLoadingSeccionesData(false)
      }
    }

    loadSeccionesData()
  }, [])

  // Enriquecer datos con información de secciones si es necesario
  const enrichedData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return []
    }

    // Verificar si necesitamos enriquecer los datos
    const firstRow = data[0]
    const needsDistrito = !firstRow.DISTRITO || firstRow.DISTRITO === "No especificado"
    const needsMunicipio = !firstRow.MUNICIPIO || firstRow.MUNICIPIO === "No especificado"

    // Si no necesitamos enriquecer o no tenemos datos de secciones, devolver los datos originales
    if ((!needsDistrito && !needsMunicipio) || Object.keys(seccionesData).length === 0) {
      return data
    }

    // Enriquecer los datos
    return data.map((row) => {
      const seccionKey = row.SECCION?.toString()
      const seccionInfo = seccionKey ? seccionesData[seccionKey] : null

      if (!seccionInfo) {
        return row
      }

      return {
        ...row,
        DISTRITO: needsDistrito ? seccionInfo.distrito : row.DISTRITO,
        MUNICIPIO: needsMunicipio ? seccionInfo.municipio : row.MUNICIPIO,
      }
    })
  }, [data, seccionesData])

  // Crear un mapa de relaciones entre municipios, distritos y secciones
  const { municipioDistritoMap, distritoSeccionMap, districts, municipalities, sections } = useMemo(() => {
    if (!enrichedData || !Array.isArray(enrichedData) || enrichedData.length === 0) {
      return {
        municipioDistritoMap: {},
        distritoSeccionMap: {},
        districts: [],
        municipalities: [],
        sections: [],
      }
    }

    try {
      // Mapas para relaciones jerárquicas
      const municipioDistritoMap: Record<string, Set<string>> = {}
      const distritoSeccionMap: Record<string, Set<string>> = {}

      // Conjuntos para valores únicos
      const districtSet = new Set<string>()
      const municipalitySet = new Set<string>()
      const sectionSet = new Set<string>()

      enrichedData.forEach((row) => {
        // Normalizar valores
        const distrito = String(row.DISTRITO || "").trim()
        const municipio = String(row.MUNICIPIO || "").trim()
        const seccion = String(row.SECCION || "").trim()

        if (distrito && distrito !== "No especificado") {
          districtSet.add(distrito)

          // Relación distrito-sección
          if (seccion) {
            sectionSet.add(seccion)
            if (!distritoSeccionMap[distrito]) {
              distritoSeccionMap[distrito] = new Set()
            }
            distritoSeccionMap[distrito].add(seccion)
          }
        }

        if (municipio && municipio !== "No especificado") {
          municipalitySet.add(municipio)

          // Relación municipio-distrito
          if (distrito && distrito !== "No especificado") {
            if (!municipioDistritoMap[municipio]) {
              municipioDistritoMap[municipio] = new Set()
            }
            municipioDistritoMap[municipio].add(distrito)
          }
        }
      })

      // Convertir Sets a Arrays ordenados
      return {
        municipioDistritoMap: Object.fromEntries(
          Object.entries(municipioDistritoMap).map(([k, v]) => [k, Array.from(v).sort()]),
        ),
        distritoSeccionMap: Object.fromEntries(
          Object.entries(distritoSeccionMap).map(([k, v]) => [k, Array.from(v).sort()]),
        ),
        districts: Array.from(districtSet).sort(),
        municipalities: Array.from(municipalitySet).sort(),
        sections: Array.from(sectionSet).sort(),
      }
    } catch (err) {
      console.error("Error al crear mapas de relaciones:", err)
      setError("Error al procesar los datos. Verifica el formato del archivo CSV.")
      return {
        municipioDistritoMap: {},
        distritoSeccionMap: {},
        districts: [],
        municipalities: [],
        sections: [],
      }
    }
  }, [enrichedData])

  // Obtener distritos filtrados según el municipio seleccionado
  const filteredDistricts = useMemo(() => {
    if (selectedMunicipality === "TODOS") {
      return districts
    }
    return municipioDistritoMap[selectedMunicipality] || []
  }, [selectedMunicipality, districts, municipioDistritoMap])

  // Obtener secciones filtradas según el distrito seleccionado
  const filteredSections = useMemo(() => {
    if (selectedDistrict === "TODOS") {
      // Si no hay distrito seleccionado pero hay municipio, mostrar secciones de todos los distritos del municipio
      if (selectedMunicipality !== "TODOS") {
        const districtsInMunicipality = municipioDistritoMap[selectedMunicipality] || []
        const sectionsSet = new Set<string>()

        districtsInMunicipality.forEach((district) => {
          const sectionsInDistrict = distritoSeccionMap[district] || []
          sectionsInDistrict.forEach((section) => sectionsSet.add(section))
        })

        return Array.from(sectionsSet).sort()
      }
      return sections
    }
    return distritoSeccionMap[selectedDistrict] || []
  }, [selectedDistrict, selectedMunicipality, sections, distritoSeccionMap, municipioDistritoMap])

  // Resetear selecciones cuando cambian los filtros superiores
  useEffect(() => {
    // Si cambia el municipio, resetear el distrito si no está en el municipio seleccionado
    if (selectedMunicipality !== "TODOS" && selectedDistrict !== "TODOS") {
      const districtsInMunicipality = municipioDistritoMap[selectedMunicipality] || []
      if (!districtsInMunicipality.includes(selectedDistrict)) {
        setSelectedDistrict("TODOS")
      }
    }

    // Si cambia el distrito, resetear la sección si no está en el distrito seleccionado
    if (selectedDistrict !== "TODOS" && selectedSection !== "TODOS") {
      const sectionsInDistrict = distritoSeccionMap[selectedDistrict] || []
      if (!sectionsInDistrict.includes(selectedSection)) {
        setSelectedSection("TODOS")
      }
    }
  }, [selectedMunicipality, selectedDistrict, municipioDistritoMap, distritoSeccionMap])

  // Filtrar datos según selecciones
  const filteredData = useMemo(() => {
    if (!enrichedData || !Array.isArray(enrichedData) || enrichedData.length === 0) {
      return []
    }

    setLoading(true)
    setError(null)

    try {
      let result = [...enrichedData]

      // Filtrar por municipio
      if (selectedMunicipality !== "TODOS") {
        result = result.filter((row) => {
          const rowMunicipality = String(row.MUNICIPIO || "").trim()
          return rowMunicipality === selectedMunicipality
        })
      }

      // Filtrar por distrito
      if (selectedDistrict !== "TODOS") {
        result = result.filter((row) => {
          const rowDistrict = String(row.DISTRITO || "").trim()
          return rowDistrict === selectedDistrict
        })
      }

      // Filtrar por sección
      if (selectedSection !== "TODOS") {
        result = result.filter((row) => {
          const rowSection = String(row.SECCION || "").trim()
          return rowSection === selectedSection
        })
      }

      // Agregar un log para depuración
      console.log(
        `Filtrado: ${result.length} registros de ${enrichedData.length} (Municipio: ${selectedMunicipality}, Distrito: ${selectedDistrict}, Sección: ${selectedSection})`,
      )

      setTimeout(() => setLoading(false), 300)
      return result
    } catch (err) {
      console.error("Error al filtrar datos:", err)
      setError("Error al filtrar los datos. Verifica el formato del archivo CSV.")
      setLoading(false)
      return []
    }
  }, [enrichedData, selectedMunicipality, selectedDistrict, selectedSection])

  // Extraer partidos y coaliciones de los datos
  const { parties, coalitions, aggregatedData, sectionData } = useMemo(() => {
    if (!filteredData || filteredData.length === 0) {
      return { parties: [], coalitions: [], aggregatedData: {}, sectionData: [] }
    }

    try {
      // Inicializar objeto para almacenar votos agregados
      const aggregated: Record<string, number> = {}
      const partySet = new Set<string>()
      const coalitionSet = new Set<string>()
      const sections: any[] = []

      // Determinar qué columnas representan partidos o coaliciones
      const firstRow = filteredData[0]
      const allColumns = Object.keys(firstRow)

      const voteColumns = allColumns.filter(
        (col) =>
          col !== "SECCION" &&
          col !== "CASILLA" &&
          col !== "DISTRITO" &&
          col !== "MUNICIPIO" &&
          col !== "LOCALIDAD" &&
          col !== "LISTA_NOMINAL" &&
          col !== "TOTAL_VOTOS",
      )

      // Normalizar nombres de partidos/coaliciones
      const normalizedNames: Record<string, string> = {
        PAN_PRI_PRD: "PAN-PRI-PRD",
        PVEM_PT_MORENA: "PVEM_PT_MORENA",
        PVEM_PT: "PVEM_PT",
        PVEM_MORENA: "PVEM_MORENA",
        PT_MORENA: "PT_MORENA",
        PAN_PRI: "PAN-PRI",
        PAN_PRD: "PAN-PRD",
        PRI_PRD: "PRI-PRD",
        NO_REGISTRADOS: "NO_REGISTRADAS",
      }

      // Identificar partidos y coaliciones y sumar votos
      let totalVotos = 0
      let totalListaNominal = 0

      filteredData.forEach((row) => {
        // Sumar lista nominal si está disponible
        if (row.LISTA_NOMINAL) {
          const listaNominal = Number.parseInt(row.LISTA_NOMINAL, 10) || 0
          if (!isNaN(listaNominal)) {
            totalListaNominal += listaNominal
          }
        }

        const sectionVotes: Record<string, number> = {}
        let sectionTotalVotes = 0

        voteColumns.forEach((col) => {
          // Verificar si la columna existe en los datos
          if (col in row) {
            const votes = Number.parseInt(row[col], 10) || 0
            const normalizedName = normalizedNames[col] || col

            // Sumar votos al total
            if (!isNaN(votes)) {
              aggregated[normalizedName] = (aggregated[normalizedName] || 0) + votes
              totalVotos += votes

              sectionVotes[normalizedName] = votes
              sectionTotalVotes += votes

              // Clasificar como partido o coalición
              if (col.includes("_") || col.includes("-")) {
                coalitionSet.add(normalizedName)
              } else if (col !== "NO_REGISTRADOS" && col !== "NULOS") {
                partySet.add(normalizedName)
              }
            }
          }
        })

        sections.push({
          id: row.SECCION,
          nombre: row.SECCION,
          distrito: row.DISTRITO || "N/A",
          municipio: row.MUNICIPIO || "N/A",
          votos: sectionVotes,
          total_votos: sectionTotalVotes || row.TOTAL_VOTOS || 0,
        })
      })

      // Si no hay votos totales pero tenemos TOTAL_VOTOS en los datos
      if (totalVotos === 0 && filteredData[0]?.TOTAL_VOTOS) {
        totalVotos = filteredData.reduce((sum, row) => sum + (Number(row.TOTAL_VOTOS) || 0), 0)
      }

      // Calcular porcentajes
      Object.keys(aggregated).forEach((key) => {
        if (totalVotos > 0) {
          aggregated[`${key}_porcentaje`] = (aggregated[key] / totalVotos) * 100
        } else {
          aggregated[`${key}_porcentaje`] = 0
        }
      })

      // Agregar totales y participación
      aggregated.total_votos = totalVotos
      aggregated.total_lista_nominal = totalListaNominal
      aggregated.total_secciones = filteredData.length

      if (totalListaNominal > 0) {
        aggregated.participacion = (totalVotos / totalListaNominal) * 100
      } else {
        aggregated.participacion = 0
      }

      // Agregar total de votos para compatibilidad
      aggregated.TOTAL_VOTOS = totalVotos

      // Definir coaliciones predefinidas
      const predefinedCoalitions = [
        {
          nombre: "Juntos Haremos Historia",
          partidos: ["MORENA", "PT", "PVEM", "PVEM_PT_MORENA", "PVEM_MORENA", "PT_MORENA"],
          color: "#9f7aea",
        },
        {
          nombre: "Va por México",
          partidos: ["PAN", "PRI", "PRD", "PAN-PRI-PRD", "PAN-PRI", "PAN-PRD", "PRI-PRD"],
          color: "#4c51bf",
        },
        {
          nombre: "Movimiento Ciudadano",
          partidos: ["MC"],
          color: "#dd6b20",
        },
      ]

      // Establecer coalición seleccionada si no hay una
      if (!selectedCoalition && predefinedCoalitions.length > 0) {
        setSelectedCoalition(predefinedCoalitions[0].nombre)
      }

      return {
        parties: Array.from(partySet),
        coalitions: predefinedCoalitions,
        aggregatedData: aggregated,
        sectionData: sections,
      }
    } catch (err) {
      console.error("Error al procesar datos:", err)
      setError("Error al procesar los datos. Verifica el formato del archivo CSV.")
      return { parties: [], coalitions: [], aggregatedData: {}, sectionData: [] }
    }
  }, [filteredData, selectedCoalition])

  // Manejar cambio de coalición seleccionada
  const handleCoalitionSelect = (coalitionName: string) => {
    setSelectedCoalition(coalitionName)
  }

  // Verificar si hay datos suficientes
  useEffect(() => {
    if (filteredData.length === 0 && enrichedData.length > 0) {
      setError("No hay datos para los filtros seleccionados. Intenta con otros filtros.")
    } else {
      setError(null)
    }
  }, [filteredData, enrichedData])

  return (
    <div className="space-y-6">
      {loadingSeccionesData && (
        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">Cargando datos de secciones</AlertTitle>
          <AlertDescription className="text-blue-700">
            Obteniendo información adicional de secciones para enriquecer los datos...
          </AlertDescription>
        </Alert>
      )}

      <CardSpotlight>
        <CardHeader>
          <CardTitle>Análisis de Resultados Electorales</CardTitle>
          <CardDescription>Explora y analiza los resultados electorales por distrito y municipio</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="municipality">Municipio</Label>
              <Select value={selectedMunicipality} onValueChange={setSelectedMunicipality}>
                <SelectTrigger id="municipality">
                  <SelectValue placeholder="Seleccionar municipio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos los municipios</SelectItem>
                  {municipalities.map((municipality) => (
                    <SelectItem key={municipality} value={municipality}>
                      {municipality}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="district">Distrito</Label>
              <Select
                value={selectedDistrict}
                onValueChange={setSelectedDistrict}
                disabled={filteredDistricts.length === 0}
              >
                <SelectTrigger id="district">
                  <SelectValue placeholder="Seleccionar distrito" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos los distritos</SelectItem>
                  {filteredDistricts.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="section">Sección</Label>
              <Select
                value={selectedSection}
                onValueChange={setSelectedSection}
                disabled={filteredSections.length === 0}
              >
                <SelectTrigger id="section">
                  <SelectValue placeholder="Seleccionar sección" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todas las secciones</SelectItem>
                  {filteredSections.map((section) => (
                    <SelectItem key={section} value={section}>
                      {section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-muted-foreground mb-6">
            {loading ? (
              <Skeleton className="h-5 w-64" />
            ) : (
              <p>
                Mostrando {filteredData.length} registros
                {selectedMunicipality !== "TODOS" && ` en el municipio ${selectedMunicipality}`}
                {selectedDistrict !== "TODOS" && ` en el distrito ${selectedDistrict}`}
                {selectedSection !== "TODOS" && ` en la sección ${selectedSection}`}
              </p>
            )}
          </div>

          <Tabs defaultValue="summary" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger
                value="summary"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Resumen
              </TabsTrigger>
              <TabsTrigger
                value="charts"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Gráficos
              </TabsTrigger>
              <TabsTrigger
                value="goals"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Metas
              </TabsTrigger>
              <TabsTrigger
                value="coalition"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Coaliciones
              </TabsTrigger>
            </TabsList>

            <TabsContent value="summary">
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-1/3" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                  </div>
                  <Skeleton className="h-64" />
                </div>
              ) : (
                <ResultsSummary data={aggregatedData} />
              )}
            </TabsContent>

            <TabsContent value="charts">
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-1/3" />
                  <Skeleton className="h-64" />
                  <Skeleton className="h-64" />
                </div>
              ) : (
                <ElectoralResultsChart
                  data={aggregatedData}
                  parties={parties}
                  coalitions={coalitions.map((c) => c.nombre)}
                />
              )}
            </TabsContent>

            <TabsContent value="goals">
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-1/3" />
                  <Skeleton className="h-64" />
                  <Skeleton className="h-64" />
                </div>
              ) : (
                <GoalsAnalyzer
                  data={filteredData}
                  partidos={parties}
                  coaliciones={coalitions}
                  selectedCoalition={selectedCoalition}
                  useCoalitionVotesForGoal={true} // Usar votos de coalición para la meta, no el total
                />
              )}
            </TabsContent>

            <TabsContent value="coalition">
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-1/3" />
                  <Skeleton className="h-64" />
                </div>
              ) : (
                <CoalitionBuilder
                  data={filteredData}
                  parties={parties}
                  predefinedCoalitions={coalitions}
                  selectedCoalition={selectedCoalition}
                  onCoalitionSelect={handleCoalitionSelect}
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </CardSpotlight>
    </div>
  )
}

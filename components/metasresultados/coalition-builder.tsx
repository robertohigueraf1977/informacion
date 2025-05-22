"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Check, Plus, X } from "lucide-react"

interface CoalitionBuilderProps {
  data: any[]
  parties?: string[]
  predefinedCoalitions?: any[]
  selectedCoalition?: string | null
  onCoalitionResultsChange?: (results: Record<string, any>) => void
  onCoalitionSelect?: (coalitionName: string) => void
}

export function CoalitionBuilder({
  data,
  parties = [],
  predefinedCoalitions = [],
  selectedCoalition = null,
  onCoalitionResultsChange,
  onCoalitionSelect,
}: CoalitionBuilderProps) {
  const [availableParties, setAvailableParties] = useState<string[]>([])
  const [selectedParties, setSelectedParties] = useState<string[]>([])
  const [coalitionName, setCoalitionName] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [activeCoalition, setActiveCoalition] = useState<string | null>(selectedCoalition)

  // Extraer partidos disponibles de los datos
  useEffect(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      setError("No hay datos disponibles para analizar")
      return
    }

    try {
      setError(null)

      // Si se proporcionan partidos explícitamente, usarlos
      if (parties && parties.length > 0) {
        setAvailableParties(parties)
        return
      }

      // De lo contrario, extraer partidos de los datos
      const firstRow = data[0]
      const extractedParties = Object.keys(firstRow).filter(
        (key) =>
          key !== "SECCION" &&
          key !== "DISTRITO" &&
          key !== "MUNICIPIO" &&
          key !== "LOCALIDAD" &&
          key !== "LISTA_NOMINAL" &&
          key !== "CASILLA" &&
          key !== "TOTAL_VOTOS" &&
          !key.includes("_porcentaje"),
      )

      setAvailableParties(extractedParties)
    } catch (err) {
      console.error("Error al extraer partidos:", err)
      setError("Error al procesar los datos. Verifica el formato del archivo CSV.")
    }
  }, [data, parties])

  // Establecer coalición activa cuando cambia selectedCoalition
  useEffect(() => {
    if (selectedCoalition) {
      setActiveCoalition(selectedCoalition)

      // Encontrar la coalición seleccionada y establecer sus partidos
      const coalition = predefinedCoalitions.find((c) => c.nombre === selectedCoalition)
      if (coalition) {
        setSelectedParties(coalition.partidos || [])
        setCoalitionName(coalition.nombre)
      }
    }
  }, [selectedCoalition, predefinedCoalitions])

  // Calcular resultados de la coalición
  const coalitionResults = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0 || selectedParties.length === 0) {
      return {
        totalVotos: 0,
        votosCoalicion: 0,
        porcentaje: 0,
      }
    }

    try {
      // Calcular votos totales y de la coalición
      let totalVotos = 0
      let votosCoalicion = 0

      data.forEach((row) => {
        // Calcular total de votos
        const rowTotal = Object.entries(row)
          .filter(
            ([key]) =>
              key !== "SECCION" &&
              key !== "DISTRITO" &&
              key !== "MUNICIPIO" &&
              key !== "LOCALIDAD" &&
              key !== "LISTA_NOMINAL" &&
              key !== "CASILLA" &&
              key !== "TOTAL_VOTOS" &&
              !key.includes("_porcentaje"),
          )
          .reduce((sum, [_, value]) => sum + (Number(value) || 0), 0)

        // Si el total de votos está disponible directamente, usarlo
        const rowTotalVotes = row.TOTAL_VOTOS || rowTotal
        totalVotos += rowTotalVotes

        // Calcular votos de la coalición
        const coalitionVotes = selectedParties.reduce((sum, party) => {
          return sum + (Number(row[party]) || 0)
        }, 0)

        votosCoalicion += coalitionVotes
      })

      // Calcular porcentaje
      const porcentaje = totalVotos > 0 ? (votosCoalicion / totalVotos) * 100 : 0

      // Notificar cambios si hay un callback
      if (onCoalitionResultsChange) {
        onCoalitionResultsChange({
          totalVotos,
          votosCoalicion,
          porcentaje,
          coalicionNombre: coalitionName || "Coalición personalizada",
          partidosCoalicion: selectedParties,
        })
      }

      return {
        totalVotos,
        votosCoalicion,
        porcentaje,
      }
    } catch (err) {
      console.error("Error al calcular resultados de coalición:", err)
      setError("Error al calcular los resultados de la coalición")
      return {
        totalVotos: 0,
        votosCoalicion: 0,
        porcentaje: 0,
      }
    }
  }, [data, selectedParties, coalitionName, onCoalitionResultsChange])

  // Manejar selección/deselección de partido
  const toggleParty = (party: string) => {
    setSelectedParties((prev) => (prev.includes(party) ? prev.filter((p) => p !== party) : [...prev, party]))
  }

  // Manejar selección de coalición predefinida
  const selectPredefinedCoalition = (coalition: any) => {
    setSelectedParties(coalition.partidos || [])
    setCoalitionName(coalition.nombre)
    setActiveCoalition(coalition.nombre)

    if (onCoalitionSelect) {
      onCoalitionSelect(coalition.nombre)
    }
  }

  // Crear nueva coalición personalizada
  const createCustomCoalition = () => {
    if (!coalitionName.trim()) {
      setError("Debes proporcionar un nombre para la coalición")
      return
    }

    if (selectedParties.length === 0) {
      setError("Debes seleccionar al menos un partido para la coalición")
      return
    }

    setError(null)
    setActiveCoalition(coalitionName)

    if (onCoalitionSelect) {
      onCoalitionSelect(coalitionName)
    }
  }

  // Datos para el gráfico de pastel
  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return []

    // Calcular votos por partido/coalición
    const votesByParty: Record<string, number> = {}

    // Inicializar con los partidos seleccionados
    selectedParties.forEach((party) => {
      votesByParty[party] = 0
    })

    // Calcular votos para cada partido
    data.forEach((row) => {
      Object.entries(row).forEach(([key, value]) => {
        if (
          key !== "SECCION" &&
          key !== "DISTRITO" &&
          key !== "MUNICIPIO" &&
          key !== "LOCALIDAD" &&
          key !== "LISTA_NOMINAL" &&
          key !== "CASILLA" &&
          key !== "TOTAL_VOTOS" &&
          !key.includes("_porcentaje")
        ) {
          votesByParty[key] = (votesByParty[key] || 0) + (Number(value) || 0)
        }
      })
    })

    // Convertir a formato para el gráfico
    return Object.entries(votesByParty)
      .filter(([party]) => selectedParties.includes(party))
      .map(([party, votes]) => ({
        name: party,
        value: votes,
      }))
  }, [data, selectedParties])

  // Colores para el gráfico
  const COLORS = [
    "#8884d8",
    "#83a6ed",
    "#8dd1e1",
    "#82ca9d",
    "#a4de6c",
    "#d0ed57",
    "#ffc658",
    "#ff8042",
    "#ff6361",
    "#bc5090",
  ]

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No hay datos disponibles para analizar</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Por favor, carga datos electorales para comenzar el análisis.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="predefined" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger
            value="predefined"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Coaliciones Predefinidas
          </TabsTrigger>
          <TabsTrigger
            value="custom"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Coalición Personalizada
          </TabsTrigger>
        </TabsList>

        <TabsContent value="predefined">
          <Card>
            <CardHeader>
              <CardTitle>Coaliciones Predefinidas</CardTitle>
              <CardDescription>Selecciona una coalición predefinida para analizar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {predefinedCoalitions.map((coalition) => (
                  <Card
                    key={coalition.nombre}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      activeCoalition === coalition.nombre ? "border-primary bg-primary/5" : ""
                    }`}
                    onClick={() => selectPredefinedCoalition(coalition)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">{coalition.nombre}</CardTitle>
                        {activeCoalition === coalition.nombre && <Badge className="bg-primary">Seleccionada</Badge>}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {coalition.partidos?.map((party: string) => (
                          <Badge key={party} variant="outline">
                            {party}
                          </Badge>
                        ))}
                      </div>
                      {activeCoalition === coalition.nombre && (
                        <div className="mt-2 pt-2 border-t">
                          <div className="text-sm">
                            <div className="flex justify-between">
                              <span>Votos:</span>
                              <span className="font-medium">{coalitionResults.votosCoalicion.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Porcentaje:</span>
                              <span className="font-medium">{coalitionResults.porcentaje.toFixed(2)}%</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom">
          <Card>
            <CardHeader>
              <CardTitle>Crear Coalición Personalizada</CardTitle>
              <CardDescription>Selecciona los partidos que formarán parte de la coalición</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="coalition-name">Nombre de la Coalición</Label>
                      <Input
                        id="coalition-name"
                        value={coalitionName}
                        onChange={(e) => setCoalitionName(e.target.value)}
                        placeholder="Ej: Coalición por el Cambio"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Seleccionar Partidos</Label>
                      <ScrollArea className="h-[300px] border rounded-md p-4 mt-1">
                        <div className="space-y-2">
                          {availableParties.map((party) => (
                            <div key={party} className="flex items-center space-x-2">
                              <Checkbox
                                id={`party-${party}`}
                                checked={selectedParties.includes(party)}
                                onCheckedChange={() => toggleParty(party)}
                              />
                              <Label htmlFor={`party-${party}`} className="cursor-pointer">
                                {party}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>

                    <Button onClick={createCustomCoalition} className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      {activeCoalition === coalitionName ? "Actualizar Coalición" : "Crear Coalición"}
                    </Button>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Resultados de la Coalición</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedParties.length > 0 ? (
                        <div className="space-y-4">
                          <div className="flex flex-wrap gap-1">
                            {selectedParties.map((party) => (
                              <Badge key={party} variant="outline" className="flex items-center gap-1">
                                {party}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-4 w-4 ml-1 p-0"
                                  onClick={() => toggleParty(party)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </Badge>
                            ))}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-muted/30 p-4 rounded-lg">
                              <div className="text-sm text-muted-foreground">Total de Votos</div>
                              <div className="text-2xl font-bold">{coalitionResults.totalVotos.toLocaleString()}</div>
                            </div>

                            <div className="bg-muted/30 p-4 rounded-lg">
                              <div className="text-sm text-muted-foreground">Votos de la Coalición</div>
                              <div className="text-2xl font-bold">
                                {coalitionResults.votosCoalicion.toLocaleString()}
                              </div>
                            </div>

                            <div className="bg-muted/30 p-4 rounded-lg">
                              <div className="text-sm text-muted-foreground">Porcentaje</div>
                              <div className="text-2xl font-bold">{coalitionResults.porcentaje.toFixed(2)}%</div>
                            </div>
                          </div>

                          <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={chartData}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                                  outerRadius={120}
                                  fill="#8884d8"
                                  dataKey="value"
                                >
                                  {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip formatter={(value: any) => [`${value.toLocaleString()} votos`, "Votos"]} />
                                <Legend />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-8 text-center">
                          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                            <Check className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <h3 className="text-lg font-medium">Selecciona partidos para tu coalición</h3>
                          <p className="text-sm text-muted-foreground mt-2">
                            Marca los partidos que deseas incluir en la coalición personalizada
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

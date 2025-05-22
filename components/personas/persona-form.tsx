"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPicker } from "@/components/personas/map-picker"
import { Badge } from "@/components/ui/badge"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useDebounce } from "@/hooks/use-debounce"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

type Persona = {
  id: number
  nombre: string
  apellidoPaterno: string
  apellidoMaterno: string | null
  fechaNacimiento: Date | null
  curp: string | null
  claveElector: string | null
  seccionId: number | null
  telefono: string | null
  email: string | null
  sectorId: number | null
  referente: boolean
  referidoPorId: number | null
  domicilio?: {
    id: number
    calle: string
    numero: string | null
    colonia: string | null
    localidad: string | null
    codigoPostal: string | null
    referencias: string | null
    latitud: number | null
    longitud: number | null
    seccionId: number | null
    municipioId: number | null
  } | null
}

type Seccion = {
  id: number
  nombre: string
  municipio: {
    id: number
    nombre: string
  } | null
  distritoLocal?: {
    id: number
    nombre: string | null
  } | null
  distritoFederal?: {
    id: number
    nombre: string | null
  } | null
}

type Sector = {
  id: number
  nombre: string
}

type Referente = {
  id: number
  nombre: string
  apellidoPaterno: string
  apellidoMaterno: string | null
}

type Municipio = {
  id: number
  nombre: string
}

type DistritoLocal = {
  id: number
  nombre: string | null
}

type DistritoFederal = {
  id: number
  nombre: string | null
}

interface PersonaFormProps {
  persona?: Persona
  secciones: Seccion[]
  sectores: Sector[]
  referentes: Referente[]
  municipios: Municipio[]
  distritosLocales: DistritoLocal[]
  distritosFederales: DistritoFederal[]
}

const formSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  apellidoPaterno: z.string().min(1, "El apellido paterno es requerido"),
  apellidoMaterno: z.string().optional(),
  fechaNacimiento: z.string().optional(),
  curp: z.string().optional(),
  claveElector: z.string().optional(),
  seccionId: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email("Correo electrónico inválido").optional().or(z.literal("")),
  sectorId: z.string().optional(),
  referente: z.boolean().default(false),
  referidoPorId: z.string().optional(),
  // Domicilio
  calle: z.string().min(1, "La calle es requerida"),
  numero: z.string().optional(),
  colonia: z.string().optional(),
  localidad: z.string().optional(),
  codigoPostal: z.string().optional(),
  referencias: z.string().optional(),
  latitud: z.string().optional(),
  longitud: z.string().optional(),
})

export function PersonaForm({
  persona,
  secciones,
  sectores,
  referentes,
  municipios,
  distritosLocales,
  distritosFederales,
}: PersonaFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isEditing = !!persona
  const [position, setPosition] = useState<[number, number]>([
    persona?.domicilio?.latitud || 24.13307907237313,
    persona?.domicilio?.longitud || -110.34244072447111,
  ])

  // Estados para la búsqueda de secciones
  const [seccionSearch, setSeccionSearch] = useState("")
  const debouncedSeccionSearch = useDebounce(seccionSearch, 300)
  const [filteredSecciones, setFilteredSecciones] = useState<Seccion[]>(secciones)
  const [seccionOpen, setSeccionOpen] = useState(false)
  const [selectedSeccion, setSelectedSeccion] = useState<Seccion | null>(
    persona?.seccionId ? secciones.find((s) => s.id === persona.seccionId) || null : null,
  )

  // Filtros adicionales para secciones
  const [municipioFilter, setMunicipioFilter] = useState<number | null>(null)
  const [distritoLocalFilter, setDistritoLocalFilter] = useState<number | null>(null)
  const [distritoFederalFilter, setDistritoFederalFilter] = useState<number | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: persona?.nombre || "",
      apellidoPaterno: persona?.apellidoPaterno || "",
      apellidoMaterno: persona?.apellidoMaterno || "",
      fechaNacimiento: persona?.fechaNacimiento ? new Date(persona.fechaNacimiento).toISOString().split("T")[0] : "",
      curp: persona?.curp || "",
      claveElector: persona?.claveElector || "",
      seccionId: persona?.seccionId ? String(persona.seccionId) : "",
      telefono: persona?.telefono || "",
      email: persona?.email || "",
      sectorId: persona?.sectorId ? String(persona.sectorId) : "",
      referente: persona?.referente || false,
      referidoPorId: persona?.referidoPorId ? String(persona.referidoPorId) : "",
      // Domicilio
      calle: persona?.domicilio?.calle || "",
      numero: persona?.domicilio?.numero || "",
      colonia: persona?.domicilio?.colonia || "",
      localidad: persona?.domicilio?.localidad || "",
      codigoPostal: persona?.domicilio?.codigoPostal || "",
      referencias: persona?.domicilio?.referencias || "",
      latitud: persona?.domicilio?.latitud ? String(persona.domicilio.latitud) : String(position[0]),
      longitud: persona?.domicilio?.longitud ? String(persona.domicilio.longitud) : String(position[1]),
    },
  })

  // Actualizar los campos de latitud y longitud cuando cambia la posición del mapa
  useEffect(() => {
    form.setValue("latitud", String(position[0]))
    form.setValue("longitud", String(position[1]))
  }, [position, form])

  // Filtrar secciones basado en la búsqueda y filtros
  useEffect(() => {
    let filtered = secciones

    // Aplicar filtro de búsqueda
    if (debouncedSeccionSearch) {
      filtered = filtered.filter((seccion) =>
        seccion.nombre.toLowerCase().includes(debouncedSeccionSearch.toLowerCase()),
      )
    }

    // Aplicar filtro de municipio
    if (municipioFilter) {
      filtered = filtered.filter((seccion) => seccion.municipio?.id === municipioFilter)
    }

    // Aplicar filtro de distrito local
    if (distritoLocalFilter) {
      filtered = filtered.filter((seccion) => seccion.distritoLocal?.id === distritoLocalFilter)
    }

    // Aplicar filtro de distrito federal
    if (distritoFederalFilter) {
      filtered = filtered.filter((seccion) => seccion.distritoFederal?.id === distritoFederalFilter)
    }

    setFilteredSecciones(filtered)
  }, [debouncedSeccionSearch, municipioFilter, distritoLocalFilter, distritoFederalFilter, secciones])

  // Manejar la selección de sección
  const handleSeccionSelect = (seccionId: number) => {
    const seccion = secciones.find((s) => s.id === seccionId)
    if (seccion) {
      setSelectedSeccion(seccion)
      form.setValue("seccionId", String(seccion.id))
      setSeccionOpen(false)
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("Enviando datos:", values)
      const url = isEditing ? `/api/personas/${persona.id}` : "/api/personas"

      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          seccionId: values.seccionId ? Number.parseInt(values.seccionId) : null,
          sectorId: values.sectorId ? Number.parseInt(values.sectorId) : null,
          referidoPorId: values.referidoPorId ? Number.parseInt(values.referidoPorId) : null,
          fechaNacimiento: values.fechaNacimiento ? new Date(values.fechaNacimiento).toISOString() : null,
          latitud: values.latitud ? Number.parseFloat(values.latitud) : null,
          longitud: values.longitud ? Number.parseFloat(values.longitud) : null,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: isEditing ? "Persona actualizada" : "Persona creada",
          description: isEditing
            ? "La persona ha sido actualizada exitosamente"
            : "La persona ha sido creada exitosamente",
        })
        router.push("/personas")
        router.refresh()
      } else {
        console.error("Error en la respuesta:", data)
        setError(data.error || data.details || "Ocurrió un error desconocido")
        toast({
          title: "Error",
          description: data.error || data.details || "Ocurrió un error",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al enviar formulario:", error)
      setError(error.message || "Ocurrió un error inesperado")
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Tabs defaultValue="datos">
      <TabsList>
        <TabsTrigger value="datos">Datos Personales</TabsTrigger>
        <TabsTrigger value="electoral">Información Electoral</TabsTrigger>
        <TabsTrigger value="domicilio">Domicilio</TabsTrigger>
      </TabsList>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <TabsContent value="datos">
        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="nombre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="apellidoPaterno"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Apellido Paterno</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="apellidoMaterno"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Apellido Materno</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fechaNacimiento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de Nacimiento</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="curp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CURP</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="claveElector"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Clave de Elector</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="telefono"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo Electrónico</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sectorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sector</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un sector" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Ninguno</SelectItem>
                            {sectores.map((sector) => (
                              <SelectItem key={sector.id} value={String(sector.id)}>
                                {sector.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="referente"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Referente</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Marcar como referente para que pueda ser seleccionado como referidor
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="referidoPorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Referido Por</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un referente" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Ninguno</SelectItem>
                            {referentes.map((referente) => (
                              <SelectItem key={referente.id} value={String(referente.id)}>
                                {referente.apellidoPaterno} {referente.apellidoMaterno} {referente.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => router.push("/personas")} disabled={isLoading}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (isEditing ? "Actualizando..." : "Creando...") : isEditing ? "Actualizar" : "Crear"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="electoral">
        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <FormLabel>Filtrar por Municipio</FormLabel>
                      <Select
                        onValueChange={(value) => setMunicipioFilter(value === "" ? null : Number(value))}
                        defaultValue={municipioFilter ? String(municipioFilter) : ""}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un municipio" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los municipios</SelectItem>
                          {municipios.map((municipio) => (
                            <SelectItem key={municipio.id} value={String(municipio.id)}>
                              {municipio.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <FormLabel>Filtrar por Distrito Local</FormLabel>
                      <Select
                        onValueChange={(value) => setDistritoLocalFilter(value === "" ? null : Number(value))}
                        defaultValue={distritoLocalFilter ? String(distritoLocalFilter) : ""}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un distrito local" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los distritos locales</SelectItem>
                          {distritosLocales.map((distrito) => (
                            <SelectItem key={distrito.id} value={String(distrito.id)}>
                              {distrito.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <FormLabel>Filtrar por Distrito Federal</FormLabel>
                      <Select
                        onValueChange={(value) => setDistritoFederalFilter(value === "" ? null : Number(value))}
                        defaultValue={distritoFederalFilter ? String(distritoFederalFilter) : ""}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un distrito federal" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los distritos federales</SelectItem>
                          {distritosFederales.map((distrito) => (
                            <SelectItem key={distrito.id} value={String(distrito.id)}>
                              {distrito.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="seccionId"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Sección Electoral</FormLabel>
                        <Popover open={seccionOpen} onOpenChange={setSeccionOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={seccionOpen}
                                className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                              >
                                {field.value && selectedSeccion
                                  ? `Sección ${selectedSeccion.nombre}`
                                  : "Selecciona una sección"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput
                                placeholder="Buscar sección..."
                                value={seccionSearch}
                                onValueChange={setSeccionSearch}
                                className="h-9"
                              />
                              <CommandList>
                                <CommandEmpty>No se encontraron secciones.</CommandEmpty>
                                <CommandGroup>
                                  {filteredSecciones.map((seccion) => (
                                    <CommandItem
                                      key={seccion.id}
                                      value={seccion.nombre}
                                      onSelect={() => handleSeccionSelect(seccion.id)}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          field.value === String(seccion.id) ? "opacity-100" : "opacity-0",
                                        )}
                                      />
                                      Sección {seccion.nombre}
                                      {seccion.municipio && (
                                        <Badge variant="outline" className="ml-2">
                                          {seccion.municipio.nombre}
                                        </Badge>
                                      )}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedSeccion && (
                    <div className="mt-4 p-4 border rounded-md bg-muted/50">
                      <h3 className="font-medium mb-2">Información de la sección seleccionada</h3>
                      <div className="grid gap-2 md:grid-cols-3">
                        <div>
                          <p className="text-sm font-medium">Sección:</p>
                          <p className="text-sm">{selectedSeccion.nombre}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Municipio:</p>
                          <p className="text-sm">{selectedSeccion.municipio?.nombre || "No asignado"}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Distrito Local:</p>
                          <p className="text-sm">{selectedSeccion.distritoLocal?.nombre || "No asignado"}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Distrito Federal:</p>
                          <p className="text-sm">{selectedSeccion.distritoFederal?.nombre || "No asignado"}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => router.push("/personas")} disabled={isLoading}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (isEditing ? "Actualizando..." : "Creando...") : isEditing ? "Actualizar" : "Crear"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="domicilio">
        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="calle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Calle</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="numero"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="colonia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Colonia</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="localidad"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Localidad</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="codigoPostal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código Postal</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="referencias"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Referencias</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Ubicación en el Mapa</h3>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="latitud"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Latitud</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="longitud"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Longitud</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="h-[400px] w-full rounded-md overflow-hidden border">
                    <MapPicker position={position} setPosition={setPosition} />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => router.push("/personas")} disabled={isLoading}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (isEditing ? "Actualizando..." : "Creando...") : isEditing ? "Actualizar" : "Crear"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

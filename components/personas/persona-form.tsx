"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPicker } from "@/components/personas/map-picker";

type Persona = {
  id: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string | null;
  fechaNacimiento: Date | null;
  curp: string | null;
  claveElector: string | null;
  seccionId: number | null;
  telefono: string | null;
  email: string | null;
  sectorId: number | null;
  referente: boolean;
  referidoPorId: number | null;
  domicilio?: {
    id: number;
    calle: string;
    numero: string | null;
    colonia: string | null;
    localidad: string | null;
    codigoPostal: string | null;
    referencias: string | null;
    latitud: number | null;
    longitud: number | null;
    seccionId: number | null;
    municipioId: number | null;
  } | null;
};

type Seccion = {
  id: number;
  nombre: string;
  municipio: {
    nombre: string;
  };
};

type Sector = {
  id: number;
  nombre: string;
};

type Referente = {
  id: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string | null;
};

interface PersonaFormProps {
  persona?: Persona;
  secciones: Seccion[];
  sectores: Sector[];
  referentes: Referente[];
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
  email: z
    .string()
    .email("Correo electrónico inválido")
    .optional()
    .or(z.literal("")),
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
});

export function PersonaForm({
  persona,
  secciones,
  sectores,
  referentes,
}: PersonaFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!persona;
  const [position, setPosition] = useState<[number, number]>([
    persona?.domicilio?.latitud || 24.13307907237313,
    persona?.domicilio?.longitud || -110.34244072447111,
  ]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: persona?.nombre || "",
      apellidoPaterno: persona?.apellidoPaterno || "",
      apellidoMaterno: persona?.apellidoMaterno || "",
      fechaNacimiento: persona?.fechaNacimiento
        ? new Date(persona.fechaNacimiento).toISOString().split("T")[0]
        : "",
      curp: persona?.curp || "",
      claveElector: persona?.claveElector || "",
      seccionId: persona?.seccionId ? String(persona.seccionId) : "",
      telefono: persona?.telefono || "",
      email: persona?.email || "",
      sectorId: persona?.sectorId ? String(persona.sectorId) : "",
      referente: persona?.referente || false,
      referidoPorId: persona?.referidoPorId
        ? String(persona.referidoPorId)
        : "",
      // Domicilio
      calle: persona?.domicilio?.calle || "",
      numero: persona?.domicilio?.numero || "",
      colonia: persona?.domicilio?.colonia || "",
      localidad: persona?.domicilio?.localidad || "",
      codigoPostal: persona?.domicilio?.codigoPostal || "",
      referencias: persona?.domicilio?.referencias || "",
      latitud: persona?.domicilio?.latitud
        ? String(persona.domicilio.latitud)
        : String(position[0]),
      longitud: persona?.domicilio?.longitud
        ? String(persona.domicilio.longitud)
        : String(position[1]),
    },
  });

  // Actualizar los campos de latitud y longitud cuando cambia la posición del mapa
  useEffect(() => {
    form.setValue("latitud", String(position[0]));
    form.setValue("longitud", String(position[1]));
  }, [position, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      const url = isEditing ? `/api/personas/${persona.id}` : "/api/personas";

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          seccionId: values.seccionId
            ? Number.parseInt(values.seccionId)
            : null,
          sectorId: values.sectorId ? Number.parseInt(values.sectorId) : null,
          referidoPorId: values.referidoPorId
            ? Number.parseInt(values.referidoPorId)
            : null,
          fechaNacimiento: values.fechaNacimiento
            ? new Date(values.fechaNacimiento).toISOString()
            : null,
          latitud: values.latitud ? Number.parseFloat(values.latitud) : null,
          longitud: values.longitud ? Number.parseFloat(values.longitud) : null,
        }),
      });

      if (response.ok) {
        toast({
          title: isEditing ? "Persona actualizada" : "Persona creada",
          description: isEditing
            ? "La persona ha sido actualizada exitosamente"
            : "La persona ha sido creada exitosamente",
        });
        router.push("/personas");
        router.refresh();
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.error || "Ocurrió un error",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Tabs defaultValue="datos">
      <TabsList>
        <TabsTrigger value="datos">Datos Personales</TabsTrigger>
        <TabsTrigger value="domicilio">Domicilio</TabsTrigger>
      </TabsList>
      <TabsContent value="datos">
        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
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
                    name="seccionId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sección</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una sección" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Ninguna</SelectItem>
                            {secciones.map((seccion) => (
                              <SelectItem
                                key={seccion.id}
                                value={String(seccion.id)}
                              >
                                {seccion.nombre} - {seccion.municipio.nombre}
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
                    name="sectorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sector</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un sector" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Ninguno</SelectItem>
                            {sectores.map((sector) => (
                              <SelectItem
                                key={sector.id}
                                value={String(sector.id)}
                              >
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
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Referente</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Marcar como referente para que pueda ser
                            seleccionado como referidor
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
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un referente" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Ninguno</SelectItem>
                            {referentes.map((referente) => (
                              <SelectItem
                                key={referente.id}
                                value={String(referente.id)}
                              >
                                {referente.apellidoPaterno}{" "}
                                {referente.apellidoMaterno} {referente.nombre}
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/personas")}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading
                      ? isEditing
                        ? "Actualizando..."
                        : "Creando..."
                      : isEditing
                      ? "Actualizar"
                      : "Crear"}
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
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
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
                    <h3 className="text-lg font-medium">
                      Ubicación en el Mapa
                    </h3>
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/personas")}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading
                      ? isEditing
                        ? "Actualizando..."
                        : "Creando..."
                      : isEditing
                      ? "Actualizar"
                      : "Crear"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

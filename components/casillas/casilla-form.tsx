"use client";

import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPicker } from "@/components/personas/map-picker";

type Casilla = {
  id: number;
  numero: string;
  tipo: string;
  seccionId: number;
  direccion: string | null;
  latitud: number | null;
  longitud: number | null;
};

type Seccion = {
  id: number;
  nombre: string;
  municipio: {
    nombre: string;
  };
};

interface CasillaFormProps {
  casilla?: Casilla;
  secciones: Seccion[];
}

const formSchema = z.object({
  numero: z.string().min(1, "El numero es requerido"),
  tipo: z.enum(["BASICA", "CONTIGUA", "EXTRAORDINARIA", "ESPECIAL"]),
  seccionId: z.string().min(1, "La sección es requerida"),
  direccion: z.string().optional(),
  latitud: z.string().optional(),
  longitud: z.string().optional(),
});

export function CasillaForm({ casilla, secciones }: CasillaFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!casilla;
  const [position, setPosition] = useState<[number, number]>([
    casilla?.latitud || 24.13307907237313,
    casilla?.longitud || -110.34244072447111,
  ]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      numero: casilla?.numero || "",
      tipo: casilla?.tipo || "BASICA",
      seccionId: casilla?.seccionId ? String(casilla.seccionId) : "",
      direccion: casilla?.direccion || "",
      latitud: casilla?.latitud ? String(casilla.latitud) : String(position[0]),
      longitud: casilla?.longitud
        ? String(casilla.longitud)
        : String(position[1]),
    },
  });

  // Actualizar los campos de latitud y longitud cuando cambia la posición del mapa
  const handlePositionChange = (newPosition: [number, number]) => {
    setPosition(newPosition);
    form.setValue("latitud", String(newPosition[0]));
    form.setValue("longitud", String(newPosition[1]));
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      const url = isEditing ? `/api/casillas/${casilla.id}` : "/api/casillas";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          seccionId: Number.parseInt(values.seccionId),
          latitud: values.latitud ? Number.parseFloat(values.latitud) : null,
          longitud: values.longitud ? Number.parseFloat(values.longitud) : null,
        }),
      });

      if (response.ok) {
        toast({
          title: isEditing ? "Casilla actualizada" : "Casilla creada",
          description: isEditing
            ? "La casilla ha sido actualizada exitosamente"
            : "La casilla ha sido creada exitosamente",
        });
        router.push("/casillas");
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
        <TabsTrigger value="datos">Datos Generales</TabsTrigger>
        <TabsTrigger value="ubicacion">Ubicación</TabsTrigger>
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
                    name="numero"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Numero</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tipo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="BASICA">Básica</SelectItem>
                            <SelectItem value="CONTIGUA">Contigua</SelectItem>
                            <SelectItem value="EXTRAORDINARIA">
                              Extraordinaria
                            </SelectItem>
                            <SelectItem value="ESPECIAL">Especial</SelectItem>
                          </SelectContent>
                        </Select>
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
                    name="direccion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dirección</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/casillas")}
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
      <TabsContent value="ubicacion">
        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
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
                  <MapPicker
                    position={position}
                    setPosition={handlePositionChange}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/casillas")}
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

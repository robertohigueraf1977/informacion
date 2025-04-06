"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import { useToast } from "@/hooks/use-toast";
import { Loader2, MapPin } from "lucide-react";

const formSchema = z.object({
  localidad: z.string().min(1, "La localidad es requerida"),
  seccion: z.string().min(1, "La sección es requerida"),
  municipio: z.string().min(1, "El municipio es requerido"),
  latitud: z.string().optional(),
  longitud: z.string().optional(),
});

export function DomicilioForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState<[number, number]>([
    24.13307907237313, -110.34244072447111,
  ]);
  const [geoError, setGeoError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      localidad: "La Paz",
      seccion: "210",
      municipio: "La Paz",
      latitud: String(position[0]),
      longitud: String(position[1]),
    },
  });

  // Actualizar los campos de latitud y longitud cuando cambia la posición
  useEffect(() => {
    form.setValue("latitud", String(position[0]));
    form.setValue("longitud", String(position[1]));
  }, [position, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: "Domicilio guardado",
      description: "Los datos del domicilio han sido guardados exitosamente",
    });
    // Aquí iría la lógica para guardar los datos
  }

  // Función para obtener la ubicación actual
  const getCurrentLocation = () => {
    setIsLoading(true);
    setGeoError(null);

    if (!navigator.geolocation) {
      setGeoError("La geolocalización no está soportada en este navegador");
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log("Ubicación obtenida:", latitude, longitude);
        setPosition([latitude, longitude]);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error de geolocalización:", error);
        let errorMsg = "Error al obtener la ubicación";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = "Usuario denegó la solicitud de geolocalización";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = "Información de ubicación no disponible";
            break;
          case error.TIMEOUT:
            errorMsg = "La solicitud de ubicación expiró";
            break;
        }

        setGeoError(errorMsg);
        toast({
          title: "Error de ubicación",
          description: errorMsg,
          variant: "destructive",
        });
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
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
            name="seccion"
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
                    <SelectItem value="210">210</SelectItem>
                    <SelectItem value="211">211</SelectItem>
                    <SelectItem value="212">212</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="municipio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Municipio</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un municipio" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="La Paz">La Paz</SelectItem>
                    <SelectItem value="Los Cabos">Los Cabos</SelectItem>
                    <SelectItem value="Comondú">Comondú</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Coordenadas</h3>
            <Button
              type="button"
              variant="outline"
              onClick={getCurrentLocation}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Obteniendo ubicación...
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4" />
                  Obtener mi ubicación
                </>
              )}
            </Button>
          </div>

          {geoError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{geoError}</span>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="latitud"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Latitud</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={position[0].toString()}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value);
                        if (!isNaN(Number.parseFloat(value))) {
                          setPosition([Number.parseFloat(value), position[1]]);
                        }
                      }}
                    />
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
                    <Input
                      {...field}
                      value={position[1].toString()}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value);
                        if (!isNaN(Number.parseFloat(value))) {
                          setPosition([position[0], Number.parseFloat(value)]);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button type="submit">Guardar</Button>
      </form>
    </Form>
  );
}

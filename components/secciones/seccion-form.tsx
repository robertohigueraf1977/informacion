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

type Seccion = {
  id: number;
  nombre: string;
  municipioId: number | null;
  distritoLocalId: number | null;
  distritoFederalId: number | null;
};

type Municipio = {
  id: number;
  nombre: string;
};

type DistritoLocal = {
  id: number;
  nombre: string | null;
};

type DistritoFederal = {
  id: number;
  nombre: string | null;
};

interface SeccionFormProps {
  seccion?: Seccion;
  municipios: Municipio[];
  distritosLocales: DistritoLocal[];
  distritosFederales: DistritoFederal[];
}

const formSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  municipioId: z.string().min(1, "El municipio es requerido"),
  distritoLocalId: z.string().optional(),
  distritoFederalId: z.string().optional(),
});

export function SeccionForm({
  seccion,
  municipios,
  distritosLocales,
  distritosFederales,
}: SeccionFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!seccion;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: seccion?.nombre || "",
      municipioId: seccion?.municipioId ? String(seccion.municipioId) : "",
      distritoLocalId: seccion?.distritoLocalId
        ? String(seccion.distritoLocalId)
        : "",
      distritoFederalId: seccion?.distritoFederalId
        ? String(seccion.distritoFederalId)
        : "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      const url = isEditing ? `/api/secciones/${seccion.id}` : "/api/secciones";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          municipioId: Number.parseInt(values.municipioId),
          distritoLocalId: values.distritoLocalId
            ? Number.parseInt(values.distritoLocalId)
            : null,
          distritoFederalId: values.distritoFederalId
            ? Number.parseInt(values.distritoFederalId)
            : null,
        }),
      });

      if (response.ok) {
        toast({
          title: isEditing ? "Sección actualizada" : "Sección creada",
          description: isEditing
            ? "La sección ha sido actualizada exitosamente"
            : "La sección ha sido creada exitosamente",
        });
        router.push("/secciones");
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
                name="municipioId"
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
                        {municipios.map((municipio) => (
                          <SelectItem
                            key={municipio.id}
                            value={String(municipio.id)}
                          >
                            {municipio.nombre}
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
                name="distritoLocalId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Distrito Local</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un distrito local" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">Ninguno</SelectItem>
                        {distritosLocales.map((distrito) => (
                          <SelectItem
                            key={distrito.id}
                            value={String(distrito.id)}
                          >
                            {distrito.nombre}
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
                name="distritoFederalId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Distrito Federal</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un distrito federal" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">Ninguno</SelectItem>
                        {distritosFederales.map((distrito) => (
                          <SelectItem
                            key={distrito.id}
                            value={String(distrito.id)}
                          >
                            {distrito.nombre}
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
                onClick={() => router.push("/secciones")}
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
  );
}

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

type Voto = {
  id: number;
  casillaId: number;
  candidatoId: number | null;
  partidoId: number | null;
  cantidad: number;
};

type Casilla = {
  id: number;
  numero: string;
  seccion: {
    nombre: string;
    municipio: {
      nombre: string;
    };
  } | null;
};

type Candidato = {
  id: number;
  nombre: string;
  cargo: string;
};

type Partido = {
  id: number;
  nombre: string;
  siglas: string;
};

interface VotoFormProps {
  voto?: Voto;
  casillas: Casilla[];
  candidatos: Candidato[];
  partidos: Partido[];
  casillaId?: number;
}

const formSchema = z.object({
  casillaId: z.string().min(1, "La casilla es requerida"),
  candidatoId: z.string().optional(),
  partidoId: z.string().optional(),
  cantidad: z.string().min(1, "La cantidad es requerida"),
});

export function VotoForm({
  voto,
  casillas,
  candidatos,
  partidos,
  casillaId,
}: VotoFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!voto;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      casillaId: voto?.casillaId
        ? String(voto.casillaId)
        : casillaId
        ? String(casillaId)
        : "",
      candidatoId: voto?.candidatoId ? String(voto.candidatoId) : "",
      partidoId: voto?.partidoId ? String(voto.partidoId) : "",
      cantidad: voto?.cantidad ? String(voto.cantidad) : "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      const url = isEditing ? `/api/votos/${voto.id}` : "/api/votos";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          casillaId: Number.parseInt(values.casillaId),
          candidatoId: values.candidatoId
            ? Number.parseInt(values.candidatoId)
            : null,
          partidoId: values.partidoId
            ? Number.parseInt(values.partidoId)
            : null,
          cantidad: Number.parseInt(values.cantidad),
        }),
      });

      if (response.ok) {
        toast({
          title: isEditing ? "Voto actualizado" : "Voto registrado",
          description: isEditing
            ? "El voto ha sido actualizado exitosamente"
            : "El voto ha sido registrado exitosamente",
        });
        if (casillaId) {
          router.push(`/casillas/${casillaId}/votos`);
        } else {
          router.push("/casillas");
        }
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
                name="casillaId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Casilla</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={!!casillaId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una casilla" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {casillas.map((casilla) => (
                          <SelectItem
                            key={casilla.id}
                            value={String(casilla.id)}
                          >
                            {casilla.numero} - {casilla.seccion?.nombre} (
                            {casilla.seccion?.municipio.nombre})
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
                name="cantidad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cantidad de Votos</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="0" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="candidatoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Candidato</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un candidato" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Ninguno</SelectItem>
                        {candidatos.map((candidato) => (
                          <SelectItem
                            key={candidato.id}
                            value={String(candidato.id)}
                          >
                            {candidato.nombre} - {candidato.cargo}
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
                name="partidoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Partido</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un partido" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Ninguno</SelectItem>
                        {partidos.map((partido) => (
                          <SelectItem
                            key={partido.id}
                            value={String(partido.id)}
                          >
                            {partido.siglas} - {partido.nombre}
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
                onClick={() => {
                  if (casillaId) {
                    router.push(`/casillas/${casillaId}/votos`);
                  } else {
                    router.push("/casillas");
                  }
                }}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? isEditing
                    ? "Actualizando..."
                    : "Registrando..."
                  : isEditing
                  ? "Actualizar"
                  : "Registrar"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Tarea = {
  id: number;
  titulo: string;
  descripcion: string | null;
  fecha: Date | null;
  completada: boolean;
  usuarioId: string | null;
  personaId: number | null;
};

type Usuario = {
  id: string;
  name: string | null;
  username: string;
};

type Persona = {
  id: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string | null;
};

interface TareaFormProps {
  tarea?: Tarea;
  usuarios: Usuario[];
  personas: Persona[];
}

const formSchema = z.object({
  titulo: z.string().min(1, "El título es requerido"),
  descripcion: z.string().optional(),
  fecha: z.date().optional().nullable(),
  completada: z.boolean().default(false),
  usuarioId: z.string().optional(),
  personaId: z.string().optional(),
});

export function TareaForm({ tarea, usuarios, personas }: TareaFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!tarea;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: tarea?.titulo || "",
      descripcion: tarea?.descripcion || "",
      fecha: tarea?.fecha ? new Date(tarea.fecha) : null,
      completada: tarea?.completada || false,
      usuarioId: tarea?.usuarioId || "",
      personaId: tarea?.personaId ? String(tarea.personaId) : "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      const url = isEditing ? `/api/tareas/${tarea.id}` : "/api/tareas";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          usuarioId: values.usuarioId === "-1" ? null : values.usuarioId,
          personaId:
            values.personaId === "-1"
              ? null
              : Number.parseInt(values.personaId),
        }),
      });

      if (response.ok) {
        toast({
          title: isEditing ? "Tarea actualizada" : "Tarea creada",
          description: isEditing
            ? "La tarea ha sido actualizada exitosamente"
            : "La tarea ha sido creada exitosamente",
        });
        router.push("/tareas");
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
                name="titulo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fecha"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: es })
                            ) : (
                              <span>Selecciona una fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="usuarioId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asignado a Usuario</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un usuario" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="-1">Ninguno</SelectItem>
                        {usuarios.map((usuario) => (
                          <SelectItem key={usuario.id} value={usuario.id}>
                            {usuario.name || usuario.username}
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
                name="personaId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relacionado con Persona</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una persona" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="-1">Ninguna</SelectItem>
                        {personas.map((persona) => (
                          <SelectItem
                            key={persona.id}
                            value={String(persona.id)}
                          >
                            {persona.apellidoPaterno} {persona.apellidoMaterno}{" "}
                            {persona.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="descripcion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={4} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="completada"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Completada</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Marcar la tarea como completada
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/tareas")}
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

"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import type { UserRole } from "@prisma/client";

type Usuario = {
  id: string;
  name: string | null;
  username: string;
  email: string | null;
  role: string;
  municipio: { nombre: string } | null;
};

interface UsuarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuario: Usuario | null;
  isCreating: boolean;
}

const formSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  username: z.string().min(1, "El nombre de usuario es requerido"),
  email: z
    .string()
    .email("Correo electrónico inválido")
    .optional()
    .or(z.literal("")),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .optional(),
  role: z.enum(["SUPER_USER", "ADMIN", "EDITOR", "USER"]),
  municipioId: z.string().optional(),
});

export function UsuarioDialog({
  open,
  onOpenChange,
  usuario,
  isCreating,
}: UsuarioDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [municipios, setMunicipios] = useState<
    { id: number; nombre: string }[]
  >([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      role: "USER",
      municipioId: "",
    },
  });

  const noneValue = "none";

  useEffect(() => {
    // Cargar municipios
    const fetchData = async () => {
      try {
        const municipiosRes = await fetch("/api/municipios");

        if (municipiosRes.ok) {
          const data = await municipiosRes.json();
          setMunicipios(data);
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    };

    if (open) {
      fetchData();
    }
  }, [open]);

  useEffect(() => {
    if (usuario) {
      form.reset({
        name: usuario.name || "",
        username: usuario.username,
        email: usuario.email || "",
        password: "",
        role: usuario.role as UserRole,
        municipioId: usuario.municipio?.nombre
          ? String(
              municipios.find((m) => m.nombre === usuario.municipio?.nombre)
                ?.id || noneValue
            )
          : noneValue,
      });
    } else {
      form.reset({
        name: "",
        username: "",
        email: "",
        password: "",
        role: "USER",
        municipioId: "",
      });
    }
  }, [usuario, form, municipios]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      const url = isCreating ? "/api/usuarios" : `/api/usuarios/${usuario?.id}`;

      const method = isCreating ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          municipioId: values.municipioId
            ? Number.parseInt(values.municipioId)
            : null,
        }),
      });

      if (response.ok) {
        toast({
          title: isCreating ? "Usuario creado" : "Usuario actualizado",
          description: isCreating
            ? "El usuario ha sido creado exitosamente"
            : "El usuario ha sido actualizado exitosamente",
        });
        onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isCreating ? "Crear Usuario" : "Editar Usuario"}
          </DialogTitle>
          <DialogDescription>
            {isCreating
              ? "Completa los campos para crear un nuevo usuario"
              : "Modifica los campos para actualizar el usuario"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
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
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de Usuario</FormLabel>
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {isCreating
                      ? "Contraseña"
                      : "Nueva Contraseña (dejar en blanco para mantener la actual)"}
                  </FormLabel>
                  <FormControl>
                    <Input {...field} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un rol" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="SUPER_USER">Super Usuario</SelectItem>
                      <SelectItem value="ADMIN">Administrador</SelectItem>
                      <SelectItem value="EDITOR">Editor</SelectItem>
                      <SelectItem value="USER">Usuario</SelectItem>
                    </SelectContent>
                  </Select>
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
                      <SelectItem value="none">Ninguno</SelectItem>
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
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? isCreating
                    ? "Creando..."
                    : "Actualizando..."
                  : isCreating
                  ? "Crear"
                  : "Actualizar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

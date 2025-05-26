"use client"

import { useState } from "react"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import type { UserRole } from "@prisma/client"

type Usuario = {
  id: string
  name: string | null
  username: string
  email: string | null
  role: string
  municipioId: number | null
  distritoLocalId: number | null
  distritoFederalId: number | null
}

type Municipio = {
  id: number
  nombre: string
}

type DistritoLocal = {
  id: number
  nombre: string
}

type DistritoFederal = {
  id: number
  nombre: string
}

interface UsuarioFormProps {
  usuario?: Usuario
  municipios: Municipio[]
  distritosLocales: DistritoLocal[]
  distritosFederales: DistritoFederal[]
}

const formSchema = z
  .object({
    name: z.string().min(1, "El nombre es requerido"),
    username: z.string().min(1, "El nombre de usuario es requerido"),
    email: z.string().email("Correo electrónico inválido").optional().or(z.literal("")),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional(),
    role: z.enum(["SUPER_USER", "ADMIN", "EDITOR", "USER"]),
    municipioId: z.string().optional(),
    distritoLocalId: z.string().optional(),
    distritoFederalId: z.string().optional(),
  })
  .refine(
    (data) => {
      // Si el rol no es SUPER_USER o ADMIN, distrito local y municipio son obligatorios
      if (data.role !== "SUPER_USER" && data.role !== "ADMIN") {
        return data.distritoLocalId && data.distritoLocalId !== "-1" && data.municipioId && data.municipioId !== "-1"
      }
      return true
    },
    {
      message: "Distrito local y municipio son obligatorios para usuarios EDITOR y USER",
      path: ["distritoLocalId"],
    },
  )

export function UsuarioForm({ usuario, municipios, distritosLocales, distritosFederales }: UsuarioFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!usuario

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: usuario?.name || "",
      username: usuario?.username || "",
      email: usuario?.email || "",
      password: "",
      role: (usuario?.role as UserRole) || "USER",
      municipioId: usuario?.municipioId ? String(usuario.municipioId) : undefined,
      distritoLocalId: usuario?.distritoLocalId ? String(usuario.distritoLocalId) : undefined,
      distritoFederalId: usuario?.distritoFederalId ? String(usuario.distritoFederalId) : undefined,
    },
  })

  const selectedRole = form.watch("role")
  const requiresDistrictAndMunicipality = selectedRole !== "SUPER_USER" && selectedRole !== "ADMIN"

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)

    try {
      const url = isEditing ? `/api/usuarios/${usuario.id}` : "/api/usuarios"
      const method = isEditing ? "PUT" : "POST"

      // Validación adicional en el frontend
      if (requiresDistrictAndMunicipality) {
        if (!values.distritoLocalId || values.distritoLocalId === "-1") {
          toast({
            title: "Error",
            description: "Distrito local es obligatorio para usuarios EDITOR y USER",
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }
        if (!values.municipioId || values.municipioId === "-1") {
          toast({
            title: "Error",
            description: "Municipio es obligatorio para usuarios EDITOR y USER",
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          municipioId: values.municipioId && values.municipioId !== "-1" ? Number.parseInt(values.municipioId) : null,
          distritoLocalId:
            values.distritoLocalId && values.distritoLocalId !== "-1" ? Number.parseInt(values.distritoLocalId) : null,
          distritoFederalId:
            values.distritoFederalId && values.distritoFederalId !== "-1"
              ? Number.parseInt(values.distritoFederalId)
              : null,
        }),
      })

      if (response.ok) {
        toast({
          title: isEditing ? "Usuario actualizado" : "Usuario creado",
          description: isEditing
            ? "El usuario ha sido actualizado exitosamente"
            : "El usuario ha sido creado exitosamente",
        })
        router.push("/usuarios")
        router.refresh()
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Ocurrió un error",
          variant: "destructive",
        })
      }
    } catch (error) {
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
    <Card>
      <CardContent className="pt-6">
        {requiresDistrictAndMunicipality && (
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Los usuarios con rol EDITOR y USER deben tener asignado un distrito local y municipio para poder acceder
              solo a la información de su área.
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
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
                      {isEditing ? "Nueva Contraseña (dejar en blanco para mantener la actual)" : "Contraseña"}
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <FormLabel>
                      Municipio
                      {requiresDistrictAndMunicipality && <span className="text-red-500 ml-1">*</span>}
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger
                          className={
                            requiresDistrictAndMunicipality && (!field.value || field.value === "-1")
                              ? "border-red-500"
                              : ""
                          }
                        >
                          <SelectValue placeholder="Selecciona un municipio" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {!requiresDistrictAndMunicipality && <SelectItem value="-1">Ninguno</SelectItem>}
                        {municipios.map((municipio) => (
                          <SelectItem key={municipio.id} value={String(municipio.id)}>
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
                    <FormLabel>
                      Distrito Local
                      {requiresDistrictAndMunicipality && <span className="text-red-500 ml-1">*</span>}
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger
                          className={
                            requiresDistrictAndMunicipality && (!field.value || field.value === "-1")
                              ? "border-red-500"
                              : ""
                          }
                        >
                          <SelectValue placeholder="Selecciona un distrito local" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {!requiresDistrictAndMunicipality && <SelectItem value="-1">Ninguno</SelectItem>}
                        {distritosLocales.map((distrito) => (
                          <SelectItem key={distrito.id} value={String(distrito.id)}>
                            {distrito.nombre || `Distrito Local ${distrito.id}`}
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
                    <FormLabel>Distrito Federal (Opcional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un distrito federal" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="-1">Ninguno</SelectItem>
                        {distritosFederales.map((distrito) => (
                          <SelectItem key={distrito.id} value={String(distrito.id)}>
                            {distrito.nombre || `Distrito Federal ${distrito.id}`}
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
              <Button type="button" variant="outline" onClick={() => router.push("/usuarios")} disabled={isLoading}>
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
  )
}

"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"

type Casilla = {
  id: number
  numero: string
  seccionId: number
}

type Seccion = {
  id: number
  nombre: string
  municipio: {
    nombre: string
  }
}

interface CasillaFormProps {
  casilla?: Casilla
  secciones: Seccion[]
}

const formSchema = z.object({
  seccionId: z.string().min(1, "La sección es requerida"),
})

export function CasillaForm({ casilla, secciones }: CasillaFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!casilla

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      seccionId: casilla?.seccionId ? String(casilla.seccionId) : "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)

    try {
      const url = isEditing ? `/api/casillas/${casilla.id}` : "/api/casillas"
      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          seccionId: Number.parseInt(values.seccionId),
        }),
      })

      if (response.ok) {
        toast({
          title: isEditing ? "Casilla actualizada" : "Casilla creada",
          description: isEditing
            ? "La casilla ha sido actualizada exitosamente"
            : "La casilla ha sido creada exitosamente",
        })
        router.push("/casillas")
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6">
              <FormField
                control={form.control}
                name="seccionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sección</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una sección" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {secciones.map((seccion) => (
                          <SelectItem key={seccion.id} value={String(seccion.id)}>
                            {seccion.nombre} - {seccion.municipio.nombre}
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
              <Button type="button" variant="outline" onClick={() => router.push("/casillas")} disabled={isLoading}>
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


"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { MoreHorizontal, Pencil, Trash, UserCog } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"

type Persona = {
  id: number
  nombre: string
  apellidoPaterno: string
  apellidoMaterno: string | null
  telefono: string | null
  email: string | null
  referente: boolean
  seccion?: {
    nombre: string
  } | null
  sector?: {
    nombre: string
  } | null
}

export function PersonasTable({ personas }: { personas: Persona[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [personaToDelete, setPersonaToDelete] = useState<Persona | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!personaToDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/personas/${personaToDelete.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Persona eliminada",
          description: "La persona ha sido eliminada exitosamente",
        })
        router.refresh()
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Error al eliminar la persona",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al eliminar la persona",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      setPersonaToDelete(null)
    }
  }

  const columns = [
    {
      accessorKey: "nombre",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
    },
    {
      accessorKey: "apellidoPaterno",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Apellido Paterno" />,
    },
    {
      accessorKey: "apellidoMaterno",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Apellido Materno" />,
      cell: ({ row }) => <div>{row.getValue("apellidoMaterno") || "-"}</div>,
    },
    {
      accessorKey: "telefono",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Teléfono" />,
      cell: ({ row }) => <div>{row.getValue("telefono") || "-"}</div>,
    },
    {
      accessorKey: "email",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
      cell: ({ row }) => <div>{row.getValue("email") || "-"}</div>,
    },
    {
      accessorKey: "seccion",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Sección" />,
      cell: ({ row }) => {
        const seccion = row.original.seccion
        return <div>{seccion?.nombre || "-"}</div>
      },
    },
    {
      accessorKey: "sector",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Sector" />,
      cell: ({ row }) => {
        const sector = row.original.sector
        return <div>{sector?.nombre || "-"}</div>
      },
    },
    {
      accessorKey: "referente",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Referente" />,
      cell: ({ row }) => {
        const referente = row.getValue("referente")
        return referente ? <Badge variant="default">Sí</Badge> : <Badge variant="outline">No</Badge>
      },
    },
    {
      id: "acciones",
      cell: ({ row }) => {
        const persona = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/personas/${persona.id}`} className="flex items-center">
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </DropdownMenuItem>
              {!persona.referente && (
                <DropdownMenuItem
                  onClick={async () => {
                    try {
                      const response = await fetch(`/api/personas/${persona.id}`, {
                        method: "PATCH",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ referente: true }),
                      })

                      if (response.ok) {
                        toast({
                          title: "Persona actualizada",
                          description: "La persona ha sido marcada como referente",
                        })
                        router.refresh()
                      } else {
                        const data = await response.json()
                        toast({
                          title: "Error",
                          description: data.error || "Error al actualizar la persona",
                          variant: "destructive",
                        })
                      }
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: "Ocurrió un error al actualizar la persona",
                        variant: "destructive",
                      })
                    }
                  }}
                >
                  <UserCog className="mr-2 h-4 w-4" />
                  Marcar como referente
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => {
                  setPersonaToDelete(persona)
                  setIsDeleteDialogOpen(true)
                }}
                className="text-destructive focus:text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={personas}
        searchColumn="nombre"
        searchPlaceholder="Buscar por nombre..."
        showExport={true}
        exportData={() => {
          // Función para exportar datos a CSV
          const headers = [
            "Nombre",
            "Apellido Paterno",
            "Apellido Materno",
            "Teléfono",
            "Email",
            "Sección",
            "Sector",
            "Referente",
          ]
          const data = personas.map((p) => [
            p.nombre,
            p.apellidoPaterno,
            p.apellidoMaterno || "",
            p.telefono || "",
            p.email || "",
            p.seccion?.nombre || "",
            p.sector?.nombre || "",
            p.referente ? "Sí" : "No",
          ])

          // Crear CSV
          const csvContent = [headers.join(","), ...data.map((row) => row.join(","))].join("\n")

          // Descargar archivo
          const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
          const url = URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.setAttribute("href", url)
          link.setAttribute("download", "personas.csv")
          link.style.visibility = "hidden"
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente a la persona
              {personaToDelete && ` ${personaToDelete.nombre} ${personaToDelete.apellidoPaterno}`} y todos sus datos
              asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import {
  MoreHorizontal,
  Pencil,
  Trash,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type Tarea = {
  id: number;
  titulo: string;
  descripcion: string | null;
  fecha: Date | null;
  completada: boolean;
  creador: {
    name: string | null;
    username: string;
  } | null;
  persona: {
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string | null;
  } | null;
};

export function TareasTable({ tareas }: { tareas: Tarea[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [tareaToDelete, setTareaToDelete] = useState<Tarea | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!tareaToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/tareas/${tareaToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Tarea eliminada",
          description: "La tarea ha sido eliminada exitosamente",
        });
        router.refresh();
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.error || "Error al eliminar la tarea",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al eliminar la tarea",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setTareaToDelete(null);
    }
  };

  const handleToggleCompletada = async (tarea: Tarea) => {
    try {
      const response = await fetch(`/api/tareas/${tarea.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completada: !tarea.completada,
        }),
      });

      if (response.ok) {
        toast({
          title: tarea.completada
            ? "Tarea marcada como pendiente"
            : "Tarea marcada como completada",
          description: tarea.completada
            ? "La tarea ha sido marcada como pendiente"
            : "La tarea ha sido marcada como completada",
        });
        router.refresh();
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.error || "Error al actualizar la tarea",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al actualizar la tarea",
        variant: "destructive",
      });
    }
  };

  const columns = [
    {
      accessorKey: "titulo",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Título" />
      ),
    },
    {
      accessorKey: "fecha",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Fecha" />
      ),
      cell: ({ row }) => {
        const fecha = row.original.fecha;
        return fecha ? format(new Date(fecha), "PPP", { locale: es }) : "-";
      },
    },
    {
      accessorKey: "creador",
      header: "Asignado a",
      cell: ({ row }) => {
        const creador = row.original.creador;
        return creador ? creador.name || creador.username : "-";
      },
    },
    {
      accessorKey: "persona",
      header: "Relacionado con",
      cell: ({ row }) => {
        const persona = row.original.persona;
        return persona
          ? `${persona.apellidoPaterno} ${persona.apellidoMaterno || ""} ${
              persona.nombre
            }`
          : "-";
      },
    },
    {
      accessorKey: "completada",
      header: "Estado",
      cell: ({ row }) => {
        const completada = row.original.completada;
        return (
          <Badge variant={completada ? "success" : "outline"}>
            {completada ? "Completada" : "Pendiente"}
          </Badge>
        );
      },
    },
    {
      id: "acciones",
      cell: ({ row }) => {
        const tarea = row.original;
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
                <Link
                  href={`/tareas/${tarea.id}`}
                  className="flex items-center"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleToggleCompletada(tarea)}>
                {tarea.completada ? (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    Marcar como pendiente
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Marcar como completada
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setTareaToDelete(tarea);
                  setIsDeleteDialogOpen(true);
                }}
                className="text-destructive focus:text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={tareas}
        searchColumn="titulo"
        searchPlaceholder="Buscar tarea..."
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              la tarea
              {tareaToDelete && ` "${tareaToDelete.titulo}"`}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
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
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
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

type Seccion = {
  id: number;
  nombre: string;
  municipio: {
    nombre: string;
  } | null;
  distritoLocal: {
    nombre: string | null;
  } | null;
  distritoFederal: {
    nombre: string | null;
  } | null;
  personas: { id: number }[];
  domicilios: { id: number }[];
};

export function SeccionesTable({ secciones }: { secciones: Seccion[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [seccionToDelete, setSeccionToDelete] = useState<Seccion | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!seccionToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/secciones/${seccionToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Sección eliminada",
          description: "La sección ha sido eliminada exitosamente",
        });
        router.refresh();
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.error || "Error al eliminar la sección",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al eliminar la sección",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setSeccionToDelete(null);
    }
  };

  const columns = [
    {
      accessorKey: "nombre",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Nombre" />
      ),
    },
    {
      accessorKey: "municipio",
      header: "Municipio",
      cell: ({ row }) => {
        const municipio = row.original.municipio;
        return <div>{municipio?.nombre || "-"}</div>;
      },
    },
    {
      accessorKey: "distritoLocal",
      header: "Distrito Local",
      cell: ({ row }) => {
        const distritoLocal = row.original.distritoLocal;
        return <div>{distritoLocal?.nombre || "-"}</div>;
      },
    },
    {
      accessorKey: "distritoFederal",
      header: "Distrito Federal",
      cell: ({ row }) => {
        const distritoFederal = row.original.distritoFederal;
        return <div>{distritoFederal?.nombre || "-"}</div>;
      },
    },
    {
      accessorKey: "personas",
      header: "Personas",
      cell: ({ row }) => {
        const personas = row.original.personas;
        return (
          <div>
            {personas.length} {personas.length === 1 ? "persona" : "personas"}
          </div>
        );
      },
    },
    {
      id: "acciones",
      cell: ({ row }) => {
        const seccion = row.original;
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
                  href={`/secciones/${seccion.id}`}
                  className="flex items-center"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSeccionToDelete(seccion);
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
        data={secciones}
        searchColumn="nombre"
        searchPlaceholder="Buscar sección..."
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
              la sección
              {seccionToDelete && ` "${seccionToDelete.nombre}"`} y todos los
              datos asociados.
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

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
import { Badge } from "@/components/ui/badge";

type Voto = {
  id: number;
  cantidad: number;
  casilla: {
    id: number;
    numero: string;
    seccion: {
      nombre: string;
      municipio: {
        nombre: string;
      };
    } | null;
  };
  candidato: {
    id: number;
    nombre: string;
    cargo: string;
  } | null;
  partido: {
    id: number;
    nombre: string;
    siglas: string;
  } | null;
};

interface VotosTableProps {
  votos: Voto[];
  casillaId?: number;
}

export function VotosTable({ votos, casillaId }: VotosTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [votoToDelete, setVotoToDelete] = useState<Voto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!votoToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/votos/${votoToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Voto eliminado",
          description: "El voto ha sido eliminado exitosamente",
        });
        router.refresh();
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.error || "Error al eliminar el voto",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al eliminar el voto",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setVotoToDelete(null);
    }
  };

  const columns = [
    ...(casillaId
      ? []
      : [
          {
            accessorKey: "casilla",
            header: ({ column }) => (
              <DataTableColumnHeader column={column} title="Casilla" />
            ),
            cell: ({ row }) => {
              const casilla = row.original.casilla;
              return (
                <div>
                  {casilla.numero} - {casilla.seccion?.nombre} (
                  {casilla.seccion?.municipio.nombre})
                </div>
              );
            },
          },
        ]),
    {
      accessorKey: "candidato",
      header: "Candidato",
      cell: ({ row }) => {
        const candidato = row.original.candidato;
        return candidato ? (
          <div>
            {candidato.nombre} - {candidato.cargo}
          </div>
        ) : (
          "-"
        );
      },
    },
    {
      accessorKey: "partido",
      header: "Partido",
      cell: ({ row }) => {
        const partido = row.original.partido;
        return partido ? (
          <Badge variant="outline">
            {partido.siglas} - {partido.nombre}
          </Badge>
        ) : (
          "-"
        );
      },
    },
    {
      accessorKey: "cantidad",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Cantidad" />
      ),
      cell: ({ row }) => {
        return <div className="font-medium">{row.original.cantidad}</div>;
      },
    },
    {
      id: "acciones",
      cell: ({ row }) => {
        const voto = row.original;
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
                  href={
                    casillaId
                      ? `/casillas/${casillaId}/votos/${voto.id}`
                      : `/votos/${voto.id}`
                  }
                  className="flex items-center"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setVotoToDelete(voto);
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
        data={votos}
        searchColumn={casillaId ? "candidato.nombre" : "casilla.numero"}
        searchPlaceholder={
          casillaId ? "Buscar por candidato..." : "Buscar por casilla..."
        }
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
              el registro de voto seleccionado.
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

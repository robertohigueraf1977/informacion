"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { UsuarioDialog } from "./usuario-dialog";
import { useToast } from "@/hooks/use-toast";

type Usuario = {
  id: string;
  name: string | null;
  username: string;
  email: string | null;
  role: string;
  municipio: { nombre: string } | null;
};

export function UsuariosTable({ usuarios }: { usuarios: Usuario[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleEdit = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setIsCreating(false);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedUsuario(null);
    setIsCreating(true);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      try {
        const response = await fetch(`/api/usuarios/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          toast({
            title: "Usuario eliminado",
            description: "El usuario ha sido eliminado exitosamente",
          });
          router.refresh();
        } else {
          const data = await response.json();
          toast({
            title: "Error",
            description: data.error || "Error al eliminar el usuario",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Ocurrió un error al eliminar el usuario",
          variant: "destructive",
        });
      }
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "SUPER_USER":
        return "destructive";
      case "ADMIN":
        return "default";
      case "EDITOR":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Municipio</TableHead>
              <TableHead className="w-[80px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No hay usuarios registrados
                </TableCell>
              </TableRow>
            ) : (
              usuarios.map((usuario) => (
                <TableRow key={usuario.id}>
                  <TableCell>{usuario.name || "-"}</TableCell>
                  <TableCell>{usuario.username}</TableCell>
                  <TableCell>{usuario.email || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(usuario.role)}>
                      {usuario.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{usuario.municipio?.nombre || "-"}</TableCell>
                  <TableCell>
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
                        <DropdownMenuItem onClick={() => handleEdit(usuario)}>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(usuario.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <UsuarioDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        usuario={selectedUsuario}
        isCreating={isCreating}
      />
    </>
  );
}

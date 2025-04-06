import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function UsuariosPage() {
  const session = await getServerSession(authOptions);

  // Verificar si el usuario está autenticado y es SUPER_USER
  if (!session?.user || session.user.role !== UserRole.SUPER_USER) {
    redirect("/dashboard");
  }

  const usuarios = await db.user.findMany({
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      role: true,
      municipio: {
        select: {
          nombre: true,
        },
      },
    },
    orderBy: {
      username: "asc",
    },
  });

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Administración de Usuarios</h1>
          <p className="text-muted-foreground">
            Gestiona los usuarios del sistema
          </p>
        </div>
        <Button asChild>
          <Link href="/usuarios/crear">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Usuario
          </Link>
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
              <TableHead className="w-[100px]">Acciones</TableHead>
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
                    <div className="flex space-x-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/usuarios/${usuario.id}`}>Editar</Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

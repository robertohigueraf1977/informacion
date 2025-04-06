import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Plus } from "lucide-react";
import { redirect } from "next/navigation";

export default async function PersonasPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  const personas = await db.persona.findMany({
    select: {
      id: true,
      nombre: true,
      apellidoPaterno: true,
      apellidoMaterno: true,
      telefono: true,
      email: true,
      referente: true,
      seccion: {
        select: {
          nombre: true,
        },
      },
      sector: {
        select: {
          nombre: true,
        },
      },
    },
    orderBy: [
      { apellidoPaterno: "asc" },
      { apellidoMaterno: "asc" },
      { nombre: "asc" },
    ],
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Personas</h1>
          <p className="text-muted-foreground">
            Gestiona el padrón de personas
          </p>
        </div>
        <Button asChild>
          <Link href="/personas/crear">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Persona
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Apellido Paterno</TableHead>
              <TableHead>Apellido Materno</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Sección</TableHead>
              <TableHead>Sector</TableHead>
              <TableHead>Referente</TableHead>
              <TableHead className="w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {personas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  No hay personas registradas
                </TableCell>
              </TableRow>
            ) : (
              personas.map((persona) => (
                <TableRow key={persona.id}>
                  <TableCell>{persona.nombre}</TableCell>
                  <TableCell>{persona.apellidoPaterno}</TableCell>
                  <TableCell>{persona.apellidoMaterno || "-"}</TableCell>
                  <TableCell>{persona.telefono || "-"}</TableCell>
                  <TableCell>{persona.email || "-"}</TableCell>
                  <TableCell>{persona.seccion?.nombre || "-"}</TableCell>
                  <TableCell>{persona.sector?.nombre || "-"}</TableCell>
                  <TableCell>{persona.referente ? "Sí" : "No"}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/personas/${persona.id}`}>Editar</Link>
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

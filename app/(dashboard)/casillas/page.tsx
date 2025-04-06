import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
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
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

export default async function CasillasPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  const casillas = await db.casilla.findMany({
    select: {
      id: true,
      numero: true,
      tipo: true,
      direccion: true,
      seccion: {
        select: {
          nombre: true,
          municipio: {
            select: {
              nombre: true,
            },
          },
        },
      },
      votos: {
        select: {
          id: true,
        },
      },
    },
    orderBy: [
      {
        seccion: {
          nombre: "asc",
        },
      },
      {
        numero: "asc",
      },
    ],
  });

  const getTipoCasillaBadgeVariant = (tipo: string) => {
    switch (tipo) {
      case "BASICA":
        return "default";
      case "CONTIGUA":
        return "secondary";
      case "EXTRAORDINARIA":
        return "outline";
      case "ESPECIAL":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Casillas</h1>
          <p className="text-muted-foreground">
            Gestiona las casillas electorales
          </p>
        </div>
        <Button asChild>
          <Link href="/casillas/crear">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Casilla
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Numero</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Sección</TableHead>
              <TableHead>Municipio</TableHead>
              <TableHead>Dirección</TableHead>
              <TableHead>Votos</TableHead>
              <TableHead className="w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {casillas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No hay casillas registradas
                </TableCell>
              </TableRow>
            ) : (
              casillas.map((casilla) => (
                <TableRow key={casilla.id}>
                  <TableCell>{casilla.numero}</TableCell>
                  <TableCell>
                    <Badge variant={getTipoCasillaBadgeVariant(casilla.tipo)}>
                      {casilla.tipo}
                    </Badge>
                  </TableCell>
                  <TableCell>{casilla.seccion?.nombre || "-"}</TableCell>
                  <TableCell>
                    {casilla.seccion?.municipio?.nombre || "-"}
                  </TableCell>
                  <TableCell>{casilla.direccion || "-"}</TableCell>
                  <TableCell>{casilla.votos.length}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/casillas/${casilla.id}`}>Editar</Link>
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

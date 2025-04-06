import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { VotosTable } from "@/components/votos/votos-table";
import { Plus } from "lucide-react";

export default async function VotosPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  const votos = await db.voto.findMany({
    select: {
      id: true,
      cantidad: true,
      casilla: {
        select: {
          id: true,
          numero: true,
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
        },
      },
      candidato: {
        select: {
          id: true,
          nombre: true,
          cargo: true,
        },
      },
      partido: {
        select: {
          id: true,
          nombre: true,
          siglas: true,
        },
      },
    },
    orderBy: [
      {
        casilla: {
          numero: "asc",
        },
      },
    ],
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Votos</h1>
          <p className="text-muted-foreground">
            Gestiona los votos por casilla
          </p>
        </div>
        <Button asChild>
          <Link href="/votos/crear">
            <Plus className="mr-2 h-4 w-4" />
            Registrar Voto
          </Link>
        </Button>
      </div>

      <VotosTable votos={votos} />
    </div>
  );
}

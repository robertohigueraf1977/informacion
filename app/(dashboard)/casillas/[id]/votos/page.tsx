import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { VotosTable } from "@/components/votos/votos-table";
import { Plus, ArrowLeft } from "lucide-react";

interface CasillaVotosPageProps {
  params: {
    id: string;
  };
}

export default async function CasillaVotosPage({
  params,
}: CasillaVotosPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  const casillaId = Number.parseInt(params.id);

  // Verificar si la casilla existe
  const casilla = await db.casilla.findUnique({
    where: { id: casillaId },
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
  });

  if (!casilla) {
    notFound();
  }

  // Obtener los votos de la casilla
  const votos = await db.voto.findMany({
    where: {
      casillaId,
    },
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
        candidato: {
          nombre: "asc",
        },
      },
      {
        partido: {
          siglas: "asc",
        },
      },
    ],
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Button variant="outline" size="sm" asChild className="mb-2">
            <Link href="/casillas">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Casillas
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">
            Votos de la Casilla: {casilla.numero} - {casilla.seccion?.nombre}
          </h1>
          <p className="text-muted-foreground">
            Gestiona los votos registrados para la casilla {casilla.numero} en{" "}
            {casilla.seccion?.municipio.nombre}
          </p>
        </div>
        <Button asChild>
          <Link href={`/casillas/${casillaId}/votos/crear`}>
            <Plus className="mr-2 h-4 w-4" />
            Registrar Voto
          </Link>
        </Button>
      </div>

      <VotosTable votos={votos} casillaId={casillaId} />
    </div>
  );
}

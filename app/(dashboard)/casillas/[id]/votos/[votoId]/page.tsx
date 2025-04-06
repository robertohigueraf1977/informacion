import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { VotoForm } from "@/components/votos/voto-form";
import { EliminarVotoButton } from "@/components/votos/eliminar-voto-button";

interface EditarVotoCasillaPageProps {
  params: {
    id: string;
    votoId: string;
  };
}

export default async function EditarVotoCasillaPage({
  params,
}: EditarVotoCasillaPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  const casillaId = Number.parseInt(params.id);
  const votoId = Number.parseInt(params.votoId);

  // Verificar si la casilla existe
  const casilla = await db.casilla.findUnique({
    where: { id: casillaId },
    select: {
      id: true,
    },
  });

  if (!casilla) {
    notFound();
  }

  // Verificar si el voto existe y pertenece a la casilla
  const voto = await db.voto.findFirst({
    where: {
      id: votoId,
      casillaId,
    },
    select: {
      id: true,
      cantidad: true,
      casillaId: true,
      candidatoId: true,
      partidoId: true,
    },
  });

  if (!voto) {
    notFound();
  }

  // Obtener casillas, candidatos y partidos para el formulario
  const casillas = await db.casilla.findMany({
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

  const candidatos = await db.candidato.findMany({
    select: {
      id: true,
      nombre: true,
      cargo: true,
    },
    orderBy: {
      nombre: "asc",
    },
  });

  const partidos = await db.partido.findMany({
    select: {
      id: true,
      nombre: true,
      siglas: true,
    },
    orderBy: {
      siglas: "asc",
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Editar Voto</h1>
          <p className="text-muted-foreground">
            Modifica los datos del voto para esta casilla
          </p>
        </div>
        <EliminarVotoButton id={voto.id} casillaId={casillaId} />
      </div>

      <VotoForm
        voto={voto}
        casillas={casillas}
        candidatos={candidatos}
        partidos={partidos}
        casillaId={casillaId}
      />
    </div>
  );
}

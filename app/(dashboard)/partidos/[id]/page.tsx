import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PartidoForm } from "@/components/partidos/partido-form";
import { EliminarPartidoButton } from "@/components/partidos/eliminar-partido-button";

interface EditarPartidoPageProps {
  params: {
    id: string;
  };
}

export default async function EditarPartidoPage({
  params,
}: EditarPartidoPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  const id = Number.parseInt(params.id);

  const partido = await db.partido.findUnique({
    where: { id },
    select: {
      id: true,
      nombre: true,
      siglas: true,
    },
  });

  if (!partido) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Editar Partido Político</h1>
          <p className="text-muted-foreground">
            Modifica los datos del partido político
          </p>
        </div>
        <EliminarPartidoButton id={partido.id} nombre={partido.nombre} />
      </div>

      <PartidoForm partido={partido} />
    </div>
  );
}

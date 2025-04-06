import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { CandidatoForm } from "@/components/candidatos/candidato-form";
import { EliminarCandidatoButton } from "@/components/candidatos/eliminar-candidato-button";

interface EditarCandidatoPageProps {
  params: {
    id: string;
  };
}

export default async function EditarCandidatoPage({
  params,
}: EditarCandidatoPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  const id = Number.parseInt(params.id);

  const candidato = await db.candidato.findUnique({
    where: { id },
    select: {
      id: true,
      nombre: true,
      cargo: true,
    },
  });

  if (!candidato) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Editar Candidato</h1>
          <p className="text-muted-foreground">
            Modifica los datos del candidato
          </p>
        </div>
        <EliminarCandidatoButton id={candidato.id} nombre={candidato.nombre} />
      </div>

      <CandidatoForm candidato={candidato} />
    </div>
  );
}

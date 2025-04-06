import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { DistritoFederalForm } from "@/components/distritos/distrito-federal-form";
import { EliminarDistritoFederalButton } from "@/components/distritos/eliminar-distrito-federal-button";

interface EditarDistritoFederalPageProps {
  params: {
    id: string;
  };
}

export default async function EditarDistritoFederalPage({
  params,
}: EditarDistritoFederalPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  const id = Number.parseInt(params.id);

  const distrito = await db.distritoFederal.findUnique({
    where: { id },
    select: {
      id: true,
      nombre: true,
    },
  });

  if (!distrito) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Editar Distrito Federal</h1>
          <p className="text-muted-foreground">
            Modifica los datos del distrito federal
          </p>
        </div>
        <EliminarDistritoFederalButton
          id={distrito.id}
          nombre={distrito.nombre}
        />
      </div>

      <DistritoFederalForm distrito={distrito} />
    </div>
  );
}

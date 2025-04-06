import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { DistritoLocalForm } from "@/components/distritos/distrito-local-form";
import { EliminarDistritoLocalButton } from "@/components/distritos/eliminar-distrito-local-button";

interface EditarDistritoLocalPageProps {
  params: {
    id: string;
  };
}

export default async function EditarDistritoLocalPage({
  params,
}: EditarDistritoLocalPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  const id = Number.parseInt(params.id);

  const distrito = await db.distritoLocal.findUnique({
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
          <h1 className="text-3xl font-bold">Editar Distrito Local</h1>
          <p className="text-muted-foreground">
            Modifica los datos del distrito local
          </p>
        </div>
        <EliminarDistritoLocalButton
          id={distrito.id}
          nombre={distrito.nombre}
        />
      </div>

      <DistritoLocalForm distrito={distrito} />
    </div>
  );
}

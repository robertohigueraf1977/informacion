import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { MunicipioForm } from "@/components/municipios/municipio-form";
import { EliminarMunicipioButton } from "@/components/municipios/eliminar-municipio-button";

interface EditarMunicipioPageProps {
  params: {
    id: string;
  };
}

export default async function EditarMunicipioPage({
  params,
}: EditarMunicipioPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  const id = Number.parseInt(params.id);

  const municipio = await db.municipio.findUnique({
    where: { id },
    select: {
      id: true,
      nombre: true,
    },
  });

  if (!municipio) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Editar Municipio</h1>
          <p className="text-muted-foreground">
            Modifica los datos del municipio
          </p>
        </div>
        <EliminarMunicipioButton id={municipio.id} nombre={municipio.nombre} />
      </div>

      <MunicipioForm municipio={municipio} />
    </div>
  );
}

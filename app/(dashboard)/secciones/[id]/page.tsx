import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { SeccionForm } from "@/components/secciones/seccion-form";
import { EliminarSeccionButton } from "@/components/secciones/eliminar-seccion-button";

interface EditarSeccionPageProps {
  params: {
    id: string;
  };
}

export default async function EditarSeccionPage({
  params,
}: EditarSeccionPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  const id = Number.parseInt(params.id);

  const seccion = await db.seccion.findUnique({
    where: { id },
    select: {
      id: true,
      nombre: true,
      municipioId: true,
      distritoLocalId: true,
      distritoFederalId: true,
    },
  });

  if (!seccion) {
    notFound();
  }

  // Obtener municipios y distritos para el formulario
  const municipios = await db.municipio.findMany({
    select: {
      id: true,
      nombre: true,
    },
    orderBy: {
      nombre: "asc",
    },
  });

  const distritosLocales = await db.distritoLocal.findMany({
    select: {
      id: true,
      nombre: true,
    },
    orderBy: {
      nombre: "asc",
    },
  });

  const distritosFederales = await db.distritoFederal.findMany({
    select: {
      id: true,
      nombre: true,
    },
    orderBy: {
      nombre: "asc",
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Editar Sección</h1>
          <p className="text-muted-foreground">
            Modifica los datos de la sección
          </p>
        </div>
        <EliminarSeccionButton id={seccion.id} nombre={seccion.nombre} />
      </div>

      <SeccionForm
        seccion={seccion}
        municipios={municipios}
        distritosLocales={distritosLocales}
        distritosFederales={distritosFederales}
      />
    </div>
  );
}

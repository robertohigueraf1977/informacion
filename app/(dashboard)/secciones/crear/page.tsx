import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { SeccionForm } from "@/components/secciones/seccion-form";

export default async function CrearSeccionPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
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
      <div>
        <h1 className="text-3xl font-bold">Crear Sección</h1>
        <p className="text-muted-foreground">
          Completa el formulario para crear una nueva sección
        </p>
      </div>

      <SeccionForm
        municipios={municipios}
        distritosLocales={distritosLocales}
        distritosFederales={distritosFederales}
      />
    </div>
  );
}

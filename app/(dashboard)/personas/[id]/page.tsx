import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PersonaForm } from "@/components/personas/persona-form";
import { EliminarPersonaButton } from "@/components/personas/eliminar-persona-button";
import { LeafletProvider } from "@/components/leaflet-provider";

interface EditarPersonaPageProps {
  params: {
    id: string;
  };
}

export default async function EditarPersonaPage({
  params,
}: EditarPersonaPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  // Obtener la persona a editar
  const persona = await db.persona.findUnique({
    where: { id: Number.parseInt(params.id) },
    include: {
      domicilio: true,
    },
  });

  if (!persona) {
    notFound();
  }

  // Obtener secciones y sectores para el formulario
  const secciones = await db.seccion.findMany({
    select: {
      id: true,
      nombre: true,
      municipio: {
        select: {
          nombre: true,
        },
      },
    },
    orderBy: {
      nombre: "asc",
    },
  });

  const sectores = await db.sector.findMany({
    select: {
      id: true,
      nombre: true,
    },
    orderBy: {
      nombre: "asc",
    },
  });

  // Obtener personas para referentes (excluyendo la persona actual)
  const referentes = await db.persona.findMany({
    where: {
      referente: true,
      id: {
        not: persona.id,
      },
    },
    select: {
      id: true,
      nombre: true,
      apellidoPaterno: true,
      apellidoMaterno: true,
    },
    orderBy: [
      { apellidoPaterno: "asc" },
      { apellidoMaterno: "asc" },
      { nombre: "asc" },
    ],
  });

  return (
    <LeafletProvider>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Editar Persona</h1>
            <p className="text-muted-foreground">
              Modifica los datos de la persona
            </p>
          </div>
          <EliminarPersonaButton id={persona.id} />
        </div>

        <PersonaForm
          persona={persona}
          secciones={secciones}
          sectores={sectores}
          referentes={referentes}
        />
      </div>
    </LeafletProvider>
  );
}

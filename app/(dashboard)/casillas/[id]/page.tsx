import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { CasillaForm } from "@/components/casillas/casilla-form";
import { EliminarCasillaButton } from "@/components/casillas/eliminar-casilla-button";
import { LeafletProvider } from "@/components/leaflet-prrovider";

interface EditarCasillaPageProps {
  params: {
    id: string;
  };
}

export default async function EditarCasillaPage({
  params,
}: EditarCasillaPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  const id = Number.parseInt(params.id);

  const casilla = await db.casilla.findUnique({
    where: { id },
    select: {
      id: true,
      numero: true,
      tipo: true,
      seccionId: true,
      direccion: true,
      latitud: true,
      longitud: true,
    },
  });

  if (!casilla) {
    notFound();
  }

  // Obtener secciones para el formulario
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
    orderBy: [
      {
        municipio: {
          nombre: "asc",
        },
      },
      {
        nombre: "asc",
      },
    ],
  });

  return (
    <LeafletProvider>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Editar Casilla</h1>
            <p className="text-muted-foreground">
              Modifica los datos de la casilla
            </p>
          </div>
          <EliminarCasillaButton id={casilla.id} numero={casilla.numero} />
        </div>

        <CasillaForm casilla={casilla} secciones={secciones} />
      </div>
    </LeafletProvider>
  );
}

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { CasillaForm } from "@/components/casillas/casilla-form";
import { LeafletProvider } from "@/components/leaflet-prrovider";

export default async function CrearCasillaPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
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
        <div>
          <h1 className="text-3xl font-bold">Crear Casilla</h1>
          <p className="text-muted-foreground">
            Completa el formulario para crear una nueva casilla
          </p>
        </div>

        <CasillaForm secciones={secciones} />
      </div>
    </LeafletProvider>
  );
}

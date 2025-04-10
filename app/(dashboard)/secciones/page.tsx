import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { SeccionesTable } from "@/components/secciones/secciones-table";
import { Plus } from "lucide-react";

export default async function SeccionesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  const secciones = await db.seccion.findMany({
    select: {
      id: true,
      nombre: true,
      municipio: {
        select: {
          nombre: true,
        },
      },
      distritoLocal: {
        select: {
          nombre: true,
        },
      },
      distritoFederal: {
        select: {
          nombre: true,
        },
      },
      personas: {
        select: {
          id: true,
        },
      },
      domicilios: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      nombre: "asc",
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Secciones</h1>
          <p className="text-muted-foreground">
            Gestiona las secciones electorales
          </p>
        </div>
        <Button asChild>
          <Link href="/secciones/crear">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Sección
          </Link>
        </Button>
      </div>

      <SeccionesTable secciones={secciones} />
    </div>
  );
}

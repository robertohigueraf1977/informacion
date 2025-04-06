import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { MunicipiosTable } from "@/components/municipios/municipios-table";
import { Plus } from "lucide-react";

export default async function MunicipiosPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  const municipios = await db.municipio.findMany({
    select: {
      id: true,
      nombre: true,
      secciones: {
        select: {
          id: true,
          nombre: true,
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
          <h1 className="text-3xl font-bold">Municipios</h1>
          <p className="text-muted-foreground">
            Gestiona los municipios del sistema
          </p>
        </div>
        <Button asChild>
          <Link href="/municipios/crear">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Municipio
          </Link>
        </Button>
      </div>

      <MunicipiosTable municipios={municipios} />
    </div>
  );
}

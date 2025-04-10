import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { SectorForm } from "@/components/sectores/sector-form";
import { EliminarSectorButton } from "@/components/sectores/eliminar-sector-button";

interface EditarSectorPageProps {
  params: {
    id: string;
  };
}

export default async function EditarSectorPage({
  params,
}: EditarSectorPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  const id = Number.parseInt(params.id);

  const sector = await db.sector.findUnique({
    where: { id },
    select: {
      id: true,
      nombre: true,
    },
  });

  if (!sector) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Editar Sector</h1>
          <p className="text-muted-foreground">Modifica los datos del sector</p>
        </div>
        <EliminarSectorButton id={sector.id} nombre={sector.nombre} />
      </div>

      <SectorForm sector={sector} />
    </div>
  );
}

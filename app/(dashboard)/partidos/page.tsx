import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { PartidosTable } from "@/components/partidos/partidos-table";
import { Plus } from "lucide-react";

export default async function PartidosPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  const partidos = await db.partido.findMany({
    include: {
      votos: true,
    },
    orderBy: {
      siglas: "asc",
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Partidos Políticos</h1>
          <p className="text-muted-foreground">
            Gestiona los partidos políticos para las elecciones
          </p>
        </div>
        <Button asChild>
          <Link href="/partidos/crear">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Partido
          </Link>
        </Button>
      </div>

      <PartidosTable partidos={partidos} />
    </div>
  );
}

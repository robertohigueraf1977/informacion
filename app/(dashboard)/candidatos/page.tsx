import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { CandidatosTable } from "@/components/candidatos/candidatos-table";
import { Plus } from "lucide-react";

export default async function CandidatosPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  const candidatos = await db.candidato.findMany({
    include: {
      votos: true,
    },
    orderBy: {
      nombre: "asc",
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Candidatos</h1>
          <p className="text-muted-foreground">
            Gestiona los candidatos para las elecciones
          </p>
        </div>
        <Button asChild>
          <Link href="/candidatos/crear">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Candidato
          </Link>
        </Button>
      </div>

      <CandidatosTable candidatos={candidatos} />
    </div>
  );
}

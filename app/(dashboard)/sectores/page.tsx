import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { SectoresTable } from "@/components/sectores/sectores-table";
import { Plus } from "lucide-react";

export default async function SectoresPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  const sectores = await db.sector.findMany({
    select: {
      id: true,
      nombre: true,
      personas: {
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
          <h1 className="text-3xl font-bold">Sectores</h1>
          <p className="text-muted-foreground">
            Gestiona los sectores para organizar personas
          </p>
        </div>
        <Button asChild>
          <Link href="/sectores/crear">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Sector
          </Link>
        </Button>
      </div>

      <SectoresTable sectores={sectores} />
    </div>
  );
}

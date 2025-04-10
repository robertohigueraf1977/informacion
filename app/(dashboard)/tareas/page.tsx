import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { TareasTable } from "@/components/tareas/tareas-table";
import { Plus } from "lucide-react";

export default async function TareasPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  const tareas = await db.tarea.findMany({
    select: {
      id: true,
      titulo: true,
      descripcion: true,
      fecha: true,
      completada: true,
      creador: {
        select: {
          name: true,
          username: true,
        },
      },
      persona: {
        select: {
          nombre: true,
          apellidoPaterno: true,
          apellidoMaterno: true,
        },
      },
    },
    orderBy: [
      {
        completada: "asc",
      },
      {
        fecha: "asc",
      },
    ],
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tareas</h1>
          <p className="text-muted-foreground">
            Gestiona las tareas del sistema
          </p>
        </div>
        <Button asChild>
          <Link href="/tareas/crear">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Tarea
          </Link>
        </Button>
      </div>

      <TareasTable tareas={tareas} />
    </div>
  );
}

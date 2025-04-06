import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { TareaForm } from "@/components/tareas/tarea-form";

export default async function CrearTareaPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  // Obtener usuarios y personas para el formulario
  const usuarios = await db.user.findMany({
    select: {
      id: true,
      name: true,
      username: true,
    },
    orderBy: {
      username: "asc",
    },
  });

  const personas = await db.persona.findMany({
    select: {
      id: true,
      nombre: true,
      apellidoPaterno: true,
      apellidoMaterno: true,
    },
    orderBy: [
      {
        apellidoPaterno: "asc",
      },
      {
        apellidoMaterno: "asc",
      },
      {
        nombre: "asc",
      },
    ],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Crear Tarea</h1>
        <p className="text-muted-foreground">
          Completa el formulario para crear una nueva tarea
        </p>
      </div>

      <TareaForm usuarios={usuarios} personas={personas} />
    </div>
  );
}

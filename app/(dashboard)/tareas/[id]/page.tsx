import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { TareaForm } from "@/components/tareas/tarea-form";
import { EliminarTareaButton } from "@/components/tareas/eliminar-tarea-button";

interface EditarTareaPageProps {
  params: {
    id: string;
  };
}

export default async function EditarTareaPage({
  params,
}: EditarTareaPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  const id = Number.parseInt(params.id);

  const tarea = await db.tarea.findUnique({
    where: { id },
    select: {
      id: true,
      titulo: true,
      descripcion: true,
      fechaLimite: true,
      completada: true,
      prioridad: true,
      usuarioId: true,
      personaId: true,
    },
  });

  if (!tarea) {
    notFound();
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Editar Tarea</h1>
          <p className="text-muted-foreground">
            Modifica los datos de la tarea
          </p>
        </div>
        <EliminarTareaButton id={tarea.id} titulo={tarea.titulo} />
      </div>

      <TareaForm tarea={tarea} usuarios={usuarios} personas={personas} />
    </div>
  );
}

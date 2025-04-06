import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { UserRole } from "@prisma/client";
import { UsuarioForm } from "@/components/usuarios/usuario-form";
import { db } from "@/lib/db";

export default async function CrearUsuarioPage() {
  const session = await getServerSession(authOptions);

  // Verificar si el usuario está autenticado y es SUPER_USER
  if (!session?.user || session.user.role !== UserRole.SUPER_USER) {
    redirect("/dashboard");
  }

  // Obtener municipios, distritos locales y federales para el formulario
  const municipios = await db.municipio.findMany({
    select: {
      id: true,
      nombre: true,
    },
    orderBy: {
      nombre: "asc",
    },
  });

  const distritosLocales = await db.distritoLocal.findMany({
    select: {
      id: true,
      nombre: true,
    },
    orderBy: {
      nombre: "asc",
    },
  });

  const distritosFederales = await db.distritoFederal.findMany({
    select: {
      id: true,
      nombre: true,
    },
    orderBy: {
      nombre: "asc",
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Crear Usuario</h1>
        <p className="text-muted-foreground">
          Completa el formulario para crear un nuevo usuario
        </p>
      </div>

      <UsuarioForm
        municipios={municipios}
        distritosLocales={distritosLocales}
        distritosFederales={distritosFederales}
      />
    </div>
  );
}

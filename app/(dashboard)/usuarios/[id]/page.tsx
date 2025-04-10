import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { UserRole } from "@prisma/client";
import { UsuarioForm } from "@/components/usuarios/usuario-form";
import { db } from "@/lib/db";
import { EliminarUsuarioButton } from "@/components/usuarios/eliminar-usuario-button";

interface EditarUsuarioPageProps {
  params: {
    id: string;
  };
}

export default async function EditarUsuarioPage({
  params,
}: EditarUsuarioPageProps) {
  const session = await getServerSession(authOptions);

  // Verificar si el usuario está autenticado y es SUPER_USER
  if (!session?.user || session.user.role !== UserRole.SUPER_USER) {
    redirect("/dashboard");
  }

  // Obtener el usuario a editar
  const usuario = await db.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      role: true,
      municipioId: true,
      distritoLocalId: true,
      distritoFederalId: true,
    },
  });

  if (!usuario) {
    notFound();
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Editar Usuario</h1>
          <p className="text-muted-foreground">
            Modifica los datos del usuario
          </p>
        </div>
        <EliminarUsuarioButton id={usuario.id} />
      </div>

      <UsuarioForm
        usuario={usuario}
        municipios={municipios}
        distritosLocales={distritosLocales}
        distritosFederales={distritosFederales}
      />
    </div>
  );
}

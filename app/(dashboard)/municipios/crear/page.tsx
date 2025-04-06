import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { MunicipioForm } from "@/components/municipios/municipio-form";

export default async function CrearMunicipioPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Crear Municipio</h1>
        <p className="text-muted-foreground">
          Completa el formulario para crear un nuevo municipio
        </p>
      </div>

      <MunicipioForm />
    </div>
  );
}

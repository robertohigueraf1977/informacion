import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { PartidoForm } from "@/components/partidos/partido-form";

export default async function CrearPartidoPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Crear Partido Político</h1>
        <p className="text-muted-foreground">
          Completa el formulario para crear un nuevo partido político
        </p>
      </div>

      <PartidoForm />
    </div>
  );
}

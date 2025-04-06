import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { CandidatoForm } from "@/components/candidatos/candidato-form";

export default async function CrearCandidatoPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Crear Candidato</h1>
        <p className="text-muted-foreground">
          Completa el formulario para crear un nuevo candidato
        </p>
      </div>

      <CandidatoForm />
    </div>
  );
}

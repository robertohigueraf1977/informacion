import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { DistritoFederalForm } from "@/components/distritos/distrito-federal-form";

export default async function CrearDistritoFederalPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Crear Distrito Federal</h1>
        <p className="text-muted-foreground">
          Completa el formulario para crear un nuevo distrito federal
        </p>
      </div>

      <DistritoFederalForm />
    </div>
  );
}

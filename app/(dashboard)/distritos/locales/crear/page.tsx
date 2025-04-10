import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { DistritoLocalForm } from "@/components/distritos/distrito-local-form";

export default async function CrearDistritoLocalPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Crear Distrito Local</h1>
        <p className="text-muted-foreground">
          Completa el formulario para crear un nuevo distrito local
        </p>
      </div>

      <DistritoLocalForm />
    </div>
  );
}

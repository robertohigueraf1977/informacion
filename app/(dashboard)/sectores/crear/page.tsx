import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { SectorForm } from "@/components/sectores/sector-form";

export default async function CrearSectorPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Crear Sector</h1>
        <p className="text-muted-foreground">
          Completa el formulario para crear un nuevo sector
        </p>
      </div>

      <SectorForm />
    </div>
  );
}

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { redirect } from "next/navigation"
import { DistritoMap } from "@/components/mapa/distrito-map"

export default async function MapaPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/login")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mapa Electoral</h1>
        <p className="text-muted-foreground">Visualización geográfica de distritos y secciones electorales</p>
        <p className="text-sm text-muted-foreground mt-2">
          Asegúrate de colocar el archivo 'Secciones.geojson' en la carpeta 'data' en la raíz del proyecto. Si el mapa
          no carga automáticamente, puedes usar el botón "Cargar GeoJSON" para subir el archivo manualmente.
        </p>
      </div>

      <DistritoMap />
    </div>
  )
}


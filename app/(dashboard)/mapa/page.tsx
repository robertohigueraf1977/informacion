import { DistritoMap } from "@/components/mapa/distrito-map"

export default function MapaPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Mapa Electoral</h1>
        <p className="text-muted-foreground">
          Visualización geográfica de secciones electorales con información demográfica y política.
        </p>
      </div>
      <DistritoMap />
    </div>
  )
}

import { DomicilioForm } from "@/components/domicilios/domicilio-form";
import { MapView } from "@/components/domicilios/map-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeafletProvider } from "@/components/leaflet-prrovider";

export default function DomiciliosPage() {
  return (
    <LeafletProvider>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Domicilios</h1>
          <p className="text-muted-foreground">
            Gestión de domicilios y ubicaciones
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Datos de Ubicación</CardTitle>
            </CardHeader>
            <CardContent>
              <DomicilioForm />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ubicación en el Mapa</CardTitle>
            </CardHeader>
            <CardContent>
              <MapView />
            </CardContent>
          </Card>
        </div>
      </div>
    </LeafletProvider>
  );
}

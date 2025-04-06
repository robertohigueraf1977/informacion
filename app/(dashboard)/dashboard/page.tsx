import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/lib/db";

export default async function DashboardPage() {
  // Obtener estadísticas básicas
  const personasCount = await db.persona.count();
  const tareasCount = await db.tarea.count();
  const tareasCompletadasCount = await db.tarea.count({
    where: { completada: true },
  });
  const seccionesCount = await db.seccion.count();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Bienvenido al Sistema Electoral</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Personas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{personasCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tareas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tareasCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tareas Completadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tareasCompletadasCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Secciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{seccionesCount}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="personas">
        <TabsList>
          <TabsTrigger value="personas">Personas</TabsTrigger>
          <TabsTrigger value="tareas">Tareas</TabsTrigger>
        </TabsList>
        <TabsContent value="personas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personas Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Aquí iría una tabla con las personas más recientes */}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tareas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tareas Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Aquí iría una tabla con las tareas pendientes */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

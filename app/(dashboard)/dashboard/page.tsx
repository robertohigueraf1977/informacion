import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { db } from "@/lib/db"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle, Clock } from "lucide-react"

export default async function DashboardPage() {
  // Obtener estadísticas básicas
  const personasCount = await db.persona.count()
  const tareasCount = await db.tarea.count()
  const tareasCompletadasCount = await db.tarea.count({
    where: { completada: true },
  })
  const seccionesCount = await db.seccion.count()

  // Obtener tareas recientes (últimas 5)
  const tareasRecientes = await db.tarea.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      persona: true,
      creador: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
    },
  })

  // Obtener tareas pendientes (últimas 5)
  const tareasPendientes = await db.tarea.findMany({
    where: { completada: false },
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      persona: true,
      creador: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
    },
  })

  const getPrioridadBadgeVariant = (prioridad: string) => {
    switch (prioridad) {
      case "ALTA":
        return "destructive"
      case "MEDIA":
        return "warning"
      case "BAJA":
        return "info"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Bienvenido al Sistema Electoral</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Personas</CardTitle>
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
            <CardTitle className="text-sm font-medium">Tareas Completadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tareasCompletadasCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Secciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{seccionesCount}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="personas">
        <TabsList>
          <TabsTrigger value="personas">Tareas Recientes</TabsTrigger>
          <TabsTrigger value="tareas">Tareas Pendientes</TabsTrigger>
        </TabsList>
        <TabsContent value="personas" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Tareas Recientes</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/tareas">
                  Ver todas <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {tareasRecientes.length > 0 ? (
                <div className="space-y-4">
                  {tareasRecientes.map((tarea) => (
                    <div key={tarea.id} className="flex items-start justify-between border-b pb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Link href={`/tareas/${tarea.id}`} className="font-medium hover:underline">
                            {tarea.titulo}
                          </Link>
                          <Badge variant={getPrioridadBadgeVariant(tarea.prioridad)}>{tarea.prioridad}</Badge>
                          <Badge
                            variant={tarea.completada ? "success" : "secondary"}
                            className="flex items-center gap-1"
                          >
                            {tarea.completada ? (
                              <>
                                <CheckCircle className="h-3 w-3" /> Completada
                              </>
                            ) : (
                              <>
                                <Clock className="h-3 w-3" /> Pendiente
                              </>
                            )}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Asignada a:{" "}
                          {tarea.persona ? `${tarea.persona.nombre} ${tarea.persona.apellidoPaterno}` : "N/A"}
                        </p>
                        {tarea.fecha && (
                          <p className="text-xs text-muted-foreground">
                            Fecha límite: {format(new Date(tarea.fecha), "PPP", { locale: es })}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground">No hay tareas recientes</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tareas" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Tareas Pendientes</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/tareas">
                  Ver todas <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {tareasPendientes.length > 0 ? (
                <div className="space-y-4">
                  {tareasPendientes.map((tarea) => (
                    <div key={tarea.id} className="flex items-start justify-between border-b pb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Link href={`/tareas/${tarea.id}`} className="font-medium hover:underline">
                            {tarea.titulo}
                          </Link>
                          <Badge variant={getPrioridadBadgeVariant(tarea.prioridad)}>{tarea.prioridad}</Badge>
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Pendiente
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Asignada a:{" "}
                          {tarea.persona ? `${tarea.persona.nombre} ${tarea.persona.apellidoPaterno}` : "N/A"}
                        </p>
                        {tarea.fecha && (
                          <p className="text-xs text-muted-foreground">
                            Fecha límite: {format(new Date(tarea.fecha), "PPP", { locale: es })}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground">No hay tareas pendientes</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DistritosLocalesTable } from "@/components/distritos/distritos-locales-table"
import { DistritosFederalesTable } from "@/components/distritos/distritos-federales-table"
import { Plus } from "lucide-react"

export default async function DistritosPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  // Utilizamos try/catch para manejar posibles errores en la consulta a la base de datos
  try {
    const distritosLocales = await db.distritoLocal.findMany({
      select: {
        id: true,
        nombre: true,
        secciones: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
      orderBy: {
        nombre: "asc",
      },
    })

    const distritosFederales = await db.distritoFederal.findMany({
      select: {
        id: true,
        nombre: true,
        secciones: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
      orderBy: {
        nombre: "asc",
      },
    })

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Distritos</h1>
            <p className="text-muted-foreground">Gestiona los distritos locales y federales</p>
          </div>
        </div>

        <Tabs defaultValue="locales">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="locales">Distritos Locales</TabsTrigger>
              <TabsTrigger value="federales">Distritos Federales</TabsTrigger>
            </TabsList>
            <div className="flex space-x-2">
              <Button asChild variant="outline">
                <Link href="/distritos/locales/crear">
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Distrito Local
                </Link>
              </Button>
              <Button asChild>
                <Link href="/distritos/federales/crear">
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Distrito Federal
                </Link>
              </Button>
            </div>
          </div>

          <TabsContent value="locales">
            <DistritosLocalesTable distritos={distritosLocales} />
          </TabsContent>
          <TabsContent value="federales">
            <DistritosFederalesTable distritos={distritosFederales} />
          </TabsContent>
        </Tabs>
      </div>
    )
  } catch (error) {
    console.error("Error al cargar los distritos:", error)
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Distritos</h1>
            <p className="text-muted-foreground">Gestiona los distritos locales y federales</p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">
            No se pudieron cargar los distritos. Por favor, intenta recargar la página.
          </span>
        </div>

        <div className="flex justify-end space-x-2">
          <Button asChild variant="outline">
            <Link href="/dashboard">Volver al Dashboard</Link>
          </Button>
          <Button asChild>
            <Link href="/distritos">Reintentar</Link>
          </Button>
        </div>
      </div>
    )
  }
}

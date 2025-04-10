import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DistritosLocalesTable } from "@/components/distritos/distritos-locales-table";
import { DistritosFederalesTable } from "@/components/distritos/distritos-federales-table";
import { Plus } from "lucide-react";

export default async function DistritosPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

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
  });

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
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Distritos</h1>
          <p className="text-muted-foreground">
            Gestiona los distritos locales y federales
          </p>
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
  );
}

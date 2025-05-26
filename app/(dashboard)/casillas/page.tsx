import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, FileBarChart } from "lucide-react"
import { UserRole } from "@prisma/client"

export default async function CasillasPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/login")
  }

  let casillas = []

  try {
    // SUPER_USER y ADMIN pueden ver todas las casillas
    if (session.user.role === UserRole.SUPER_USER || session.user.role === UserRole.ADMIN) {
      casillas = await db.casilla.findMany({
        select: {
          id: true,
          numero: true,
          seccion: {
            select: {
              id: true,
              nombre: true,
              municipio: {
                select: {
                  nombre: true,
                },
              },
              distritoLocal: {
                select: {
                  nombre: true,
                },
              },
            },
          },
          votos: {
            select: {
              id: true,
            },
          },
        },
        orderBy: [
          {
            seccionId: "asc",
          },
        ],
      })
    } else {
      // EDITOR y USER solo pueden ver casillas de su distrito local y municipio
      const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: {
          distritoLocalId: true,
          municipioId: true,
        },
      })

      if (user?.distritoLocalId && user?.municipioId) {
        casillas = await db.casilla.findMany({
          where: {
            seccion: {
              AND: [{ distritoLocalId: user.distritoLocalId }, { municipioId: user.municipioId }],
            },
          },
          select: {
            id: true,
            numero: true,
            seccion: {
              select: {
                id: true,
                nombre: true,
                municipio: {
                  select: {
                    nombre: true,
                  },
                },
                distritoLocal: {
                  select: {
                    nombre: true,
                  },
                },
              },
            },
            votos: {
              select: {
                id: true,
              },
            },
          },
          orderBy: [
            {
              seccionId: "asc",
            },
          ],
        })
      }
    }
  } catch (error) {
    console.error("Error al cargar casillas:", error)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Casillas</h1>
          <p className="text-muted-foreground">Gestiona las casillas electorales</p>
        </div>
        <Button asChild>
          <Link href="/casillas/crear">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Casilla
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Sección</TableHead>
              <TableHead>Municipio</TableHead>
              <TableHead>Distrito Local</TableHead>
              <TableHead>Votos</TableHead>
              <TableHead className="w-[150px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {casillas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No hay casillas registradas
                </TableCell>
              </TableRow>
            ) : (
              casillas.map((casilla) => (
                <TableRow key={casilla.id}>
                  <TableCell>{casilla.numero}</TableCell>
                  <TableCell>{casilla.seccion?.nombre || "-"}</TableCell>
                  <TableCell>{casilla.seccion?.municipio?.nombre || "-"}</TableCell>
                  <TableCell>{casilla.seccion?.distritoLocal?.nombre || "-"}</TableCell>
                  <TableCell>{casilla.votos.length}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/casillas/${casilla.id}`}>Editar</Link>
                      </Button>
                      <Button asChild size="sm">
                        <Link href={`/casillas/${casilla.id}/votos`}>
                          <FileBarChart className="mr-2 h-4 w-4" />
                          Votos
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

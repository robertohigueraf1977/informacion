import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { redirect, notFound } from "next/navigation"
import { db } from "@/lib/db"
import { CasillaForm } from "@/components/casillas/casilla-form"
import { EliminarCasillaButton } from "@/components/casillas/eliminar-casilla-button"
import { LeafletProvider } from "@/components/leaflet-prrovider"
import { UserRole } from "@prisma/client"

interface EditarCasillaPageProps {
  params: {
    id: string
  }
}

export default async function EditarCasillaPage({ params }: EditarCasillaPageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/login")
  }

  const id = Number.parseInt(params.id)

  const casilla = await db.casilla.findUnique({
    where: { id },
    select: {
      id: true,
      numero: true,
      seccionId: true,
      seccion: {
        include: {
          municipio: true,
          distritoLocal: true,
        },
      },
    },
  })

  if (!casilla) {
    notFound()
  }

  // Verificar permisos para EDITOR y USER
  if (session.user.role !== UserRole.SUPER_USER && session.user.role !== UserRole.ADMIN) {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        distritoLocalId: true,
        municipioId: true,
      },
    })

    if (!user?.distritoLocalId || !user?.municipioId) {
      redirect("/dashboard")
    }

    if (
      casilla.seccion?.distritoLocalId !== user.distritoLocalId ||
      casilla.seccion?.municipioId !== user.municipioId
    ) {
      redirect("/casillas")
    }
  }

  let secciones = []

  try {
    // SUPER_USER y ADMIN pueden ver todas las secciones
    if (session.user.role === UserRole.SUPER_USER || session.user.role === UserRole.ADMIN) {
      secciones = await db.seccion.findMany({
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
        orderBy: [
          {
            municipio: {
              nombre: "asc",
            },
          },
          {
            nombre: "asc",
          },
        ],
      })
    } else {
      // EDITOR y USER solo pueden ver secciones de su distrito local y municipio
      const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: {
          distritoLocalId: true,
          municipioId: true,
        },
      })

      if (user?.distritoLocalId && user?.municipioId) {
        secciones = await db.seccion.findMany({
          where: {
            AND: [{ distritoLocalId: user.distritoLocalId }, { municipioId: user.municipioId }],
          },
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
          orderBy: [
            {
              municipio: {
                nombre: "asc",
              },
            },
            {
              nombre: "asc",
            },
          ],
        })
      }
    }
  } catch (error) {
    console.error("Error al cargar secciones:", error)
  }

  return (
    <LeafletProvider>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Editar Casilla</h1>
            <p className="text-muted-foreground">Modifica los datos de la casilla</p>
          </div>
          <EliminarCasillaButton id={casilla.id} numero={casilla.numero} />
        </div>

        <CasillaForm casilla={casilla} secciones={secciones} />
      </div>
    </LeafletProvider>
  )
}

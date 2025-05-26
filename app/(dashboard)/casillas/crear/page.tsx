import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { CasillaForm } from "@/components/casillas/casilla-form"
import { UserRole } from "@prisma/client"

export default async function CrearCasillaPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/login")
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nueva Casilla</h1>
        <p className="text-muted-foreground">Crea una nueva casilla electoral</p>
      </div>

      <CasillaForm secciones={secciones} />
    </div>
  )
}

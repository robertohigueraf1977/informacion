import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { redirect, notFound } from "next/navigation"
import { db } from "@/lib/db"
import { VotoForm } from "@/components/votos/voto-form"
import { EliminarVotoButton } from "@/components/votos/eliminar-voto-button"

interface EditarVotoPageProps {
  params: {
    id: string
  }
}

export default async function EditarVotoPage({ params }: EditarVotoPageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/login")
  }

  const id = Number.parseInt(params.id)

  const voto = await db.voto.findUnique({
    where: { id },
    select: {
      id: true,
      cantidad: true,
      casillaId: true,
      partidoId: true,
    },
  })

  if (!voto) {
    notFound()
  }

  // Obtener casillas y partidos para el formulario
  const casillas = await db.casilla.findMany({
    select: {
      id: true,
      numero: true,
      seccion: {
        select: {
          nombre: true,
          municipio: {
            select: {
              nombre: true,
            },
          },
        },
      },
    },
    orderBy: [
      {
        seccion: {
          nombre: "asc",
        },
      },
      {
        numero: "asc",
      },
    ],
  })

  const partidos = await db.partido.findMany({
    select: {
      id: true,
      nombre: true,
    },
    orderBy: {
      nombre: "asc",
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Editar Voto</h1>
          <p className="text-muted-foreground">Modifica los datos del voto</p>
        </div>
        <EliminarVotoButton id={voto.id} />
      </div>

      <VotoForm voto={voto} casillas={casillas} partidos={partidos} />
    </div>
  )
}


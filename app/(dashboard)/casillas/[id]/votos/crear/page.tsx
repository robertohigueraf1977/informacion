import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { redirect, notFound } from "next/navigation"
import { db } from "@/lib/db"
import { VotoForm } from "@/components/votos/voto-form"

interface CrearVotoCasillaPageProps {
  params: {
    id: string
  }
}

export default async function CrearVotoCasillaPage({ params }: CrearVotoCasillaPageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/login")
  }

  const casillaId = Number.parseInt(params.id)

  // Verificar si la casilla existe
  const casilla = await db.casilla.findUnique({
    where: { id: casillaId },
    select: {
      id: true,
    },
  })

  if (!casilla) {
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
      <div>
        <h1 className="text-3xl font-bold">Registrar Voto para Casilla</h1>
        <p className="text-muted-foreground">Completa el formulario para registrar un nuevo voto en esta casilla</p>
      </div>

      <VotoForm casillas={casillas} partidos={partidos} casillaId={casillaId} />
    </div>
  )
}


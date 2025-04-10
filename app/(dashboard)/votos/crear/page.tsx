import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { VotoForm } from "@/components/votos/voto-form"

export default async function CrearVotoPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/login")
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
        <h1 className="text-3xl font-bold">Registrar Voto</h1>
        <p className="text-muted-foreground">Completa el formulario para registrar un nuevo voto</p>
      </div>

      <VotoForm casillas={casillas} partidos={partidos} />
    </div>
  )
}


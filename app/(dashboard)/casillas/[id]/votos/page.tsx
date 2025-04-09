import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { VotosTable } from "@/components/votos/votos-table"

interface VotosPageProps {
  params: {
    id: string
  }
}

export default async function VotosPage({ params }: VotosPageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/login")
  }

  const casillaId = Number.parseInt(params.id)

  const casilla = await db.casilla.findUnique({
    where: { id: casillaId },
    include: {
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
  })

  if (!casilla) {
    redirect("/casillas")
  }

  const votos = await db.voto.findMany({
    where: {
      casillaId,
    },
    include: {
      partido: true,
    },
    orderBy: [
      {
        partido: {
          nombre: "asc",
        },
      },
    ],
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Votos - Casilla {casilla.numero}</h1>
          <p className="text-muted-foreground">
            Sección: {casilla.seccion.nombre} - {casilla.seccion.municipio.nombre}
          </p>
        </div>
        <Button asChild>
          <Link href={`/casillas/${casillaId}/votos/crear`}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Voto
          </Link>
        </Button>
      </div>

      <VotosTable votos={votos} casillaId={casillaId} />

      <div className="flex justify-end">
        <Button variant="outline" asChild>
          <Link href="/casillas">Volver a Casillas</Link>
        </Button>
      </div>
    </div>
  )
}


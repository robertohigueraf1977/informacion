import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { PersonasTable } from "@/components/personas/personas-table"

export default async function PersonasPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/login")
  }

  const personas = await db.persona.findMany({
    select: {
      id: true,
      nombre: true,
      apellidoPaterno: true,
      apellidoMaterno: true,
      telefono: true,
      email: true,
      referente: true,
      seccion: {
        select: {
          nombre: true,
        },
      },
      sector: {
        select: {
          nombre: true,
        },
      },
    },
    orderBy: [{ apellidoPaterno: "asc" }, { apellidoMaterno: "asc" }, { nombre: "asc" }],
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Personas</h1>
          <p className="text-muted-foreground">Gestiona el padrón de personas</p>
        </div>
        <Button asChild>
          <Link href="/personas/crear">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Persona
          </Link>
        </Button>
      </div>

      <PersonasTable personas={personas} />
    </div>
  )
}

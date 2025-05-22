"use client"

import { useSession } from "next-auth/react"
import { UserRole } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { PersonasTable } from "@/components/personas/personas-table"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

type Persona = {
  id: number
  nombre: string
  apellidoPaterno: string
  apellidoMaterno: string | null
  telefono: string | null
  email: string | null
  referente: boolean
  seccion?: {
    nombre: string
  } | null
  sector?: {
    nombre: string
  } | null
}

export default function PersonasPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [personas, setPersonas] = useState<Persona[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Verificar si el usuario puede crear personas
  const canCreatePersonas =
    session?.user?.role === UserRole.SUPER_USER ||
    session?.user?.role === UserRole.ADMIN ||
    session?.user?.role === UserRole.EDITOR

  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        console.log("Fetching personas data...")
        const response = await fetch("/api/personas")

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error("Error fetching personas:", response.status, errorData)
          throw new Error(`Error ${response.status}: ${errorData.error || response.statusText}`)
        }

        const data = await response.json()
        console.log(`Fetched ${data.length} personas`)
        setPersonas(data)
      } catch (err) {
        console.error("Error loading personas:", err)
        setError(err.message || "Error al cargar los datos de personas")
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchPersonas()
    }
  }, [session])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Personas</h1>
          <p className="text-muted-foreground">Gestiona el padrón de personas</p>
        </div>
        {canCreatePersonas && (
          <Button onClick={() => router.push("/personas/crear")}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Persona
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <PersonasTable personas={personas} />
      )}
    </div>
  )
}

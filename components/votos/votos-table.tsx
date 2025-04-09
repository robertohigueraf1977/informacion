"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { EliminarVotoButton } from "@/components/votos/eliminar-voto-button"

type Voto = {
  id: number
  cantidad: number
  partido?: {
    id: number
    nombre: string
    siglas: string
  } | null
}

interface VotosTableProps {
  votos: Voto[]
  casillaId: number
}

export function VotosTable({ votos, casillaId }: VotosTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredData, setFilteredData] = useState(votos)

  // Filtrar datos cuando cambia el término de búsqueda
  useEffect(() => {
    if (!searchTerm) {
      setFilteredData(votos)
      return
    }

    const lowercaseSearch = searchTerm.toLowerCase()
    const filtered = votos.filter((voto) => {
      // Buscar en nombre de partido si existe
      const partidoMatch =
        voto.partido?.nombre?.toLowerCase().includes(lowercaseSearch) ||
        voto.partido?.siglas?.toLowerCase().includes(lowercaseSearch) ||
        false

      return partidoMatch
    })

    setFilteredData(filtered)
  }, [searchTerm, votos])

  const columns: ColumnDef<Voto>[] = [
    {
      accessorKey: "partido.siglas",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Partido" />,
      cell: ({ row }) => {
        const partido = row.original.partido
        return <div>{partido ? partido.siglas : "-"}</div>
      },
    },
    {
      accessorKey: "partido.nombre",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre del Partido" />,
      cell: ({ row }) => {
        const partido = row.original.partido
        return <div>{partido ? partido.nombre : "-"}</div>
      },
    },
    {
      accessorKey: "cantidad",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Cantidad" />,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const voto = row.original

        return (
          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href={`/casillas/${casillaId}/votos/${voto.id}`}>Editar</Link>
            </Button>
            <EliminarVotoButton id={voto.id} onSuccess={() => router.refresh()} />
          </div>
        )
      },
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Buscar por partido..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <DataTable columns={columns} data={filteredData} />
    </div>
  )
}


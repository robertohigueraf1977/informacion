import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { redirect, notFound } from "next/navigation"
import { db } from "@/lib/db"
import { PersonaForm } from "@/components/personas/persona-form"

// Modificar la función para manejar correctamente los parámetros dinámicos
export default async function EditarPersonaPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/login")
  }

  // Asegurarnos de que params es una promesa resuelta
  const { id: idString } = params
  const id = Number.parseInt(idString, 10)

  if (isNaN(id)) {
    notFound()
  }

  // Obtener la persona a editar
  const persona = await db.persona.findUnique({
    where: {
      id,
    },
    include: {
      domicilio: true,
    },
  })

  if (!persona) {
    notFound()
  }

  // Obtener secciones y sectores para el formulario
  const secciones = await db.seccion.findMany({
    select: {
      id: true,
      nombre: true,
      municipio: {
        select: {
          id: true,
          nombre: true,
        },
      },
      distritoLocal: {
        select: {
          id: true,
          nombre: true,
        },
      },
      distritoFederal: {
        select: {
          id: true,
          nombre: true,
        },
      },
    },
    orderBy: {
      nombre: "asc",
    },
  })

  const sectores = await db.sector.findMany({
    select: {
      id: true,
      nombre: true,
    },
    orderBy: {
      nombre: "asc",
    },
  })

  // Obtener personas para referentes
  const referentes = await db.persona.findMany({
    where: {
      referente: true,
      id: {
        not: id, // Excluir la persona actual
      },
    },
    select: {
      id: true,
      nombre: true,
      apellidoPaterno: true,
      apellidoMaterno: true,
    },
    orderBy: [{ apellidoPaterno: "asc" }, { apellidoMaterno: "asc" }, { nombre: "asc" }],
  })

  // Obtener municipios, distritos locales y federales para filtros
  const municipios = await db.municipio.findMany({
    select: {
      id: true,
      nombre: true,
    },
    orderBy: {
      nombre: "asc",
    },
  })

  const distritosLocales = await db.distritoLocal.findMany({
    select: {
      id: true,
      nombre: true,
    },
    orderBy: {
      nombre: "asc",
    },
  })

  const distritosFederales = await db.distritoFederal.findMany({
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
        <h1 className="text-3xl font-bold">Editar Persona</h1>
        <p className="text-muted-foreground">Actualiza la información de la persona</p>
      </div>

      <PersonaForm
        persona={persona}
        secciones={secciones}
        sectores={sectores}
        referentes={referentes}
        municipios={municipios}
        distritosLocales={distritosLocales}
        distritosFederales={distritosFederales}
      />
    </div>
  )
}

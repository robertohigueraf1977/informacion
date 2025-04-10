import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { PersonaForm } from "@/components/personas/persona-form"

export default async function CrearPersonaPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/login")
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
        <h1 className="text-3xl font-bold">Crear Persona</h1>
        <p className="text-muted-foreground">Completa el formulario para registrar una nueva persona</p>
      </div>

      <PersonaForm
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

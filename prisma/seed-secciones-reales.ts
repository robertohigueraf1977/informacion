import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Datos reales de secciones electorales (ejemplo para Sonora)
const seccionesSonora = [
  // Distrito Local 01, Distrito Federal 01
  { nombre: "Sección 0001", distritoLocalId: 1, distritoFederalId: 1 },
  { nombre: "Sección 0002", distritoLocalId: 1, distritoFederalId: 1 },
  { nombre: "Sección 0003", distritoLocalId: 1, distritoFederalId: 1 },
  { nombre: "Sección 0004", distritoLocalId: 1, distritoFederalId: 1 },
  { nombre: "Sección 0005", distritoLocalId: 1, distritoFederalId: 1 },

  // Distrito Local 02, Distrito Federal 01
  { nombre: "Sección 0101", distritoLocalId: 2, distritoFederalId: 1 },
  { nombre: "Sección 0102", distritoLocalId: 2, distritoFederalId: 1 },
  { nombre: "Sección 0103", distritoLocalId: 2, distritoFederalId: 1 },
  { nombre: "Sección 0104", distritoLocalId: 2, distritoFederalId: 1 },
  { nombre: "Sección 0105", distritoLocalId: 2, distritoFederalId: 1 },

  // Distrito Local 03, Distrito Federal 02
  { nombre: "Sección 0201", distritoLocalId: 3, distritoFederalId: 2 },
  { nombre: "Sección 0202", distritoLocalId: 3, distritoFederalId: 2 },
  { nombre: "Sección 0203", distritoLocalId: 3, distritoFederalId: 2 },
  { nombre: "Sección 0204", distritoLocalId: 3, distritoFederalId: 2 },
  { nombre: "Sección 0205", distritoLocalId: 3, distritoFederalId: 2 },

  // Distrito Local 04, Distrito Federal 02
  { nombre: "Sección 0301", distritoLocalId: 4, distritoFederalId: 2 },
  { nombre: "Sección 0302", distritoLocalId: 4, distritoFederalId: 2 },
  { nombre: "Sección 0303", distritoLocalId: 4, distritoFederalId: 2 },
  { nombre: "Sección 0304", distritoLocalId: 4, distritoFederalId: 2 },
  { nombre: "Sección 0305", distritoLocalId: 4, distritoFederalId: 2 },

  // Distrito Local 05, Distrito Federal 03
  { nombre: "Sección 0401", distritoLocalId: 5, distritoFederalId: 3 },
  { nombre: "Sección 0402", distritoLocalId: 5, distritoFederalId: 3 },
  { nombre: "Sección 0403", distritoLocalId: 5, distritoFederalId: 3 },
  { nombre: "Sección 0404", distritoLocalId: 5, distritoFederalId: 3 },
  { nombre: "Sección 0405", distritoLocalId: 5, distritoFederalId: 3 },

  // Hermosillo (varias secciones)
  { nombre: "Sección 1201", distritoLocalId: 9, distritoFederalId: 5 },
  { nombre: "Sección 1202", distritoLocalId: 9, distritoFederalId: 5 },
  { nombre: "Sección 1203", distritoLocalId: 9, distritoFederalId: 5 },
  { nombre: "Sección 1204", distritoLocalId: 9, distritoFederalId: 5 },
  { nombre: "Sección 1205", distritoLocalId: 9, distritoFederalId: 5 },
  { nombre: "Sección 1206", distritoLocalId: 9, distritoFederalId: 5 },
  { nombre: "Sección 1207", distritoLocalId: 9, distritoFederalId: 5 },
  { nombre: "Sección 1208", distritoLocalId: 9, distritoFederalId: 5 },
  { nombre: "Sección 1209", distritoLocalId: 9, distritoFederalId: 5 },
  { nombre: "Sección 1210", distritoLocalId: 9, distritoFederalId: 5 },

  // Más secciones de Hermosillo
  { nombre: "Sección 1301", distritoLocalId: 10, distritoFederalId: 5 },
  { nombre: "Sección 1302", distritoLocalId: 10, distritoFederalId: 5 },
  { nombre: "Sección 1303", distritoLocalId: 10, distritoFederalId: 5 },
  { nombre: "Sección 1304", distritoLocalId: 10, distritoFederalId: 5 },
  { nombre: "Sección 1305", distritoLocalId: 10, distritoFederalId: 5 },

  // Cajeme (Ciudad Obregón)
  { nombre: "Sección 2001", distritoLocalId: 15, distritoFederalId: 6 },
  { nombre: "Sección 2002", distritoLocalId: 15, distritoFederalId: 6 },
  { nombre: "Sección 2003", distritoLocalId: 15, distritoFederalId: 6 },
  { nombre: "Sección 2004", distritoLocalId: 15, distritoFederalId: 6 },
  { nombre: "Sección 2005", distritoLocalId: 15, distritoFederalId: 6 },
]

export async function main() {
  console.log("Iniciando seed de secciones electorales reales...")

  // Verificar y crear distritos locales si no existen
  const distritosLocales = await prisma.distritoLocal.findMany()
  if (distritosLocales.length === 0) {
    console.log("No se encontraron distritos locales. Creando distritos locales...")
    await prisma.distritoLocal.createMany({
      data: [
        { nombre: "Distrito Local 01 - San Luis Río Colorado" },
        { nombre: "Distrito Local 02 - Puerto Peñasco" },
        { nombre: "Distrito Local 03 - Caborca" },
        { nombre: "Distrito Local 04 - Nogales" },
        { nombre: "Distrito Local 05 - Nogales Sur" },
        { nombre: "Distrito Local 06 - Cananea" },
        { nombre: "Distrito Local 07 - Agua Prieta" },
        { nombre: "Distrito Local 08 - Hermosillo Norte" },
        { nombre: "Distrito Local 09 - Hermosillo Centro" },
        { nombre: "Distrito Local 10 - Hermosillo Sur" },
        { nombre: "Distrito Local 11 - Hermosillo Costa" },
        { nombre: "Distrito Local 12 - Hermosillo Noreste" },
        { nombre: "Distrito Local 13 - Guaymas" },
        { nombre: "Distrito Local 14 - Empalme" },
        { nombre: "Distrito Local 15 - Cajeme Norte" },
        { nombre: "Distrito Local 16 - Cajeme Centro" },
        { nombre: "Distrito Local 17 - Cajeme Sur" },
        { nombre: "Distrito Local 18 - Navojoa Norte" },
        { nombre: "Distrito Local 19 - Navojoa Sur" },
        { nombre: "Distrito Local 20 - Etchojoa" },
        { nombre: "Distrito Local 21 - Huatabampo" },
      ],
    })
    console.log("Distritos locales creados exitosamente.")
  } else {
    console.log(`Se encontraron ${distritosLocales.length} distritos locales existentes.`)
  }

  // Verificar y crear distritos federales si no existen
  const distritosFederales = await prisma.distritoFederal.findMany()
  if (distritosFederales.length === 0) {
    console.log("No se encontraron distritos federales. Creando distritos federales...")
    await prisma.distritoFederal.createMany({
      data: [
        { nombre: "Distrito Federal 01 - San Luis Río Colorado" },
        { nombre: "Distrito Federal 02 - Nogales" },
        { nombre: "Distrito Federal 03 - Hermosillo Norte" },
        { nombre: "Distrito Federal 04 - Guaymas" },
        { nombre: "Distrito Federal 05 - Hermosillo Sur" },
        { nombre: "Distrito Federal 06 - Cajeme" },
        { nombre: "Distrito Federal 07 - Navojoa" },
      ],
    })
    console.log("Distritos federales creados exitosamente.")
  } else {
    console.log(`Se encontraron ${distritosFederales.length} distritos federales existentes.`)
  }

  // Verificar si ya existen secciones
  const seccionesExistentes = await prisma.seccion.count()
  if (seccionesExistentes > 0) {
    console.log(`Ya existen ${seccionesExistentes} secciones en la base de datos.`)
    console.log("¿Deseas continuar y crear más secciones? Si es así, ejecuta con la opción --force")

    // Si no se proporciona la opción --force, salir
    if (!process.argv.includes("--force")) {
      console.log("Saliendo sin crear nuevas secciones.")
      return
    }
  }

  // Crear secciones
  console.log("Creando secciones electorales reales...")

  // Crear las secciones en la base de datos
  const seccionesCreadas = await prisma.seccion.createMany({
    data: seccionesSonora,
    skipDuplicates: true, // Omitir duplicados si los hay
  })

  console.log(`Se crearon ${seccionesCreadas.count} secciones electorales exitosamente.`)
}


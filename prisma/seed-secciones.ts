import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function main() {
  console.log(
    "Iniciando seed de secciones electorales con datos específicos..."
  );

  // Verificar y crear municipios si no existen
  const municipios = await prisma.municipio.findMany();
  if (municipios.length === 0) {
    console.log("No se encontraron municipios. Creando municipios...");
    await prisma.municipio.createMany({
      data: [
        { nombre: "Comondu" },
        { nombre: "Mulege" },
        { nombre: "La Paz" },
        { nombre: "Los Cabos" },
        { nombre: "Loreto" },
      ],
    });
    console.log("Municipios creados exitosamente.");
  } else {
    console.log(`Se encontraron ${municipios.length} municipios existentes.`);
  } 
    // Verificar y crear distritos locales si no existen
  const distritosLocales = await prisma.distritoLocal.findMany();
  if (distritosLocales.length === 0) {
    console.log(
      "No se encontraron distritos locales. Creando distritos locales..."
    );
    await prisma.distritoLocal.createMany({
      data: [
        { nombre: "2" },
        { nombre: "1" },
        { nombre: "3" },
        { nombre: "4" },
        { nombre: "5" },
        { nombre: "6" },
        { nombre: "7" },
        { nombre: "8" },
        { nombre: "9" },
        { nombre: "10" },
        { nombre: "11" },
        { nombre: "12" },
        { nombre: "13" },
        { nombre: "14" },
        { nombre: "15" },
        { nombre: "16" },
      ],
    });
    console.log("Distritos locales creados exitosamente.");
  } else {
    console.log(
      `Se encontraron ${distritosLocales.length} distritos locales existentes.`
    );
  }

  // Verificar y crear distritos federales si no existen
  const distritosFederales = await prisma.distritoFederal.findMany();
  if (distritosFederales.length === 0) {
    console.log(
      "No se encontraron distritos federales. Creando distritos federales..."
    );
    await prisma.distritoFederal.createMany({
      data: [{ nombre: "1" }, { nombre: "2" }],
    });
    console.log("Distritos federales creados exitosamente.");
  } else {
    console.log(
      `Se encontraron ${distritosFederales.length} distritos federales existentes.`
    );
  }

  // Verificar si ya existen secciones
  const seccionesExistentes = await prisma.seccion.count();
  if (seccionesExistentes > 0) {
    console.log(
      `Ya existen ${seccionesExistentes} secciones en la base de datos.`
    );
    console.log(
      "¿Deseas continuar y crear más secciones? Si es así, ejecuta con la opción --force"
    );

    // Si no se proporciona la opción --force, salir
    if (!process.argv.includes("--force")) {
      console.log("Saliendo sin crear nuevas secciones.");
      return;
    }
  }

  // Obtener los IDs de los municipios, distritos locales y federales
  const municipiosMap = new Map();
  const distritosLocalesMap = new Map();
  const distritosFederalesMap = new Map();

  const municipiosActuales = await prisma.municipio.findMany();
  const distritosLocalesActuales = await prisma.distritoLocal.findMany();
  const distritosFederalesActuales = await prisma.distritoFederal.findMany();

  municipiosActuales.forEach((m) => municipiosMap.set(m.nombre, m.id));
  distritosLocalesActuales.forEach((d) =>
    distritosLocalesMap.set(d.nombre, d.id)
  );
  distritosFederalesActuales.forEach((d) =>
    distritosFederalesMap.set(d.nombre, d.id)
  );

  // Datos específicos de secciones
  const seccionesData = [
    {
      nombre: "1",
      distritoLocalId: distritosLocalesMap.get("10"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "2",
      distritoLocalId: distritosLocalesMap.get("13"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "3",
      distritoLocalId: distritosLocalesMap.get("10"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "4",
      distritoLocalId: distritosLocalesMap.get("13"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "5",
      distritoLocalId: distritosLocalesMap.get("10"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "6",
      distritoLocalId: distritosLocalesMap.get("10"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "7",
      distritoLocalId: distritosLocalesMap.get("10"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "8",
      distritoLocalId: distritosLocalesMap.get("10"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "9",
      distritoLocalId: distritosLocalesMap.get("10"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "10",
      distritoLocalId: distritosLocalesMap.get("10"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "11",
      distritoLocalId: distritosLocalesMap.get("10"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "12",
      distritoLocalId: distritosLocalesMap.get("10"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "13",
      distritoLocalId: distritosLocalesMap.get("13"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "14",
      distritoLocalId: distritosLocalesMap.get("10"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "15",
      distritoLocalId: distritosLocalesMap.get("10"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "16",
      distritoLocalId: distritosLocalesMap.get("10"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "17",
      distritoLocalId: distritosLocalesMap.get("10"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "18",
      distritoLocalId: distritosLocalesMap.get("10"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "19",
      distritoLocalId: distritosLocalesMap.get("10"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "20",
      distritoLocalId: distritosLocalesMap.get("10"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "21",
      distritoLocalId: distritosLocalesMap.get("10"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "22",
      distritoLocalId: distritosLocalesMap.get("10"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "23",
      distritoLocalId: distritosLocalesMap.get("10"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "24",
      distritoLocalId: distritosLocalesMap.get("10"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "25",
      distritoLocalId: distritosLocalesMap.get("10"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "26",
      distritoLocalId: distritosLocalesMap.get("10"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "27",
      distritoLocalId: distritosLocalesMap.get("10"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "28",
      distritoLocalId: distritosLocalesMap.get("10"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "29",
      distritoLocalId: distritosLocalesMap.get("10"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "30",
      distritoLocalId: distritosLocalesMap.get("10"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "31",
      distritoLocalId: distritosLocalesMap.get("10"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "32",
      distritoLocalId: distritosLocalesMap.get("10"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "33",
      distritoLocalId: distritosLocalesMap.get("10"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "34",
      distritoLocalId: distritosLocalesMap.get("13"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "35",
      distritoLocalId: distritosLocalesMap.get("13"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "36",
      distritoLocalId: distritosLocalesMap.get("10"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "37",
      distritoLocalId: distritosLocalesMap.get("10"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "38",
      distritoLocalId: distritosLocalesMap.get("10"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "39",
      distritoLocalId: distritosLocalesMap.get("10"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "40",
      distritoLocalId: distritosLocalesMap.get("13"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "41",
      distritoLocalId: distritosLocalesMap.get("10"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "42",
      distritoLocalId: distritosLocalesMap.get("10"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "43",
      distritoLocalId: distritosLocalesMap.get("10"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "44",
      distritoLocalId: distritosLocalesMap.get("10"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "45",
      distritoLocalId: distritosLocalesMap.get("10"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "46",
      distritoLocalId: distritosLocalesMap.get("13"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "47",
      distritoLocalId: distritosLocalesMap.get("10"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "48",
      distritoLocalId: distritosLocalesMap.get("13"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "49",
      distritoLocalId: distritosLocalesMap.get("10"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "50",
      distritoLocalId: distritosLocalesMap.get("10"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "51",
      distritoLocalId: distritosLocalesMap.get("10"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "52",
      distritoLocalId: distritosLocalesMap.get("13"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "53",
      distritoLocalId: distritosLocalesMap.get("10"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "54",
      distritoLocalId: distritosLocalesMap.get("13"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "55",
      distritoLocalId: distritosLocalesMap.get("13"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "56",
      distritoLocalId: distritosLocalesMap.get("13"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "57",
      distritoLocalId: distritosLocalesMap.get("13"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "58",
      distritoLocalId: distritosLocalesMap.get("13"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "59",
      distritoLocalId: distritosLocalesMap.get("13"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "60",
      distritoLocalId: distritosLocalesMap.get("13"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "61",
      distritoLocalId: distritosLocalesMap.get("13"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "62",
      distritoLocalId: distritosLocalesMap.get("13"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "67",
      distritoLocalId: distritosLocalesMap.get("13"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "68",
      distritoLocalId: distritosLocalesMap.get("13"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "69",
      distritoLocalId: distritosLocalesMap.get("13"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "70",
      distritoLocalId: distritosLocalesMap.get("13"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "71",
      distritoLocalId: distritosLocalesMap.get("13"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "72",
      distritoLocalId: distritosLocalesMap.get("13"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "73",
      distritoLocalId: distritosLocalesMap.get("13"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "74",
      distritoLocalId: distritosLocalesMap.get("10"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Comondu"),
    },
    {
      nombre: "75",
      distritoLocalId: distritosLocalesMap.get("14"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Mulege"),
    },
    {
      nombre: "76",
      distritoLocalId: distritosLocalesMap.get("14"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Mulege"),
    },
    {
      nombre: "77",
      distritoLocalId: distritosLocalesMap.get("14"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Mulege"),
    },
    {
      nombre: "78",
      distritoLocalId: distritosLocalesMap.get("14"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Mulege"),
    },
    {
      nombre: "79",
      distritoLocalId: distritosLocalesMap.get("14"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Mulege"),
    },
    {
      nombre: "80",
      distritoLocalId: distritosLocalesMap.get("14"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Mulege"),
    },
    {
      nombre: "81",
      distritoLocalId: distritosLocalesMap.get("14"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Mulege"),
    },
    {
      nombre: "82",
      distritoLocalId: distritosLocalesMap.get("13"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Mulege"),
    },
    {
      nombre: "83",
      distritoLocalId: distritosLocalesMap.get("13"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Mulege"),
    },
    {
      nombre: "84",
      distritoLocalId: distritosLocalesMap.get("13"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Mulege"),
    },
    {
      nombre: "85",
      distritoLocalId: distritosLocalesMap.get("13"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Mulege"),
    },
    {
      nombre: "86",
      distritoLocalId: distritosLocalesMap.get("13"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Mulege"),
    },
    {
      nombre: "87",
      distritoLocalId: distritosLocalesMap.get("13"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Mulege"),
    },
    {
      nombre: "88",
      distritoLocalId: distritosLocalesMap.get("13"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Mulege"),
    },
    {
      nombre: "89",
      distritoLocalId: distritosLocalesMap.get("13"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Mulege"),
    },
    {
      nombre: "90",
      distritoLocalId: distritosLocalesMap.get("13"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Mulege"),
    },
    {
      nombre: "91",
      distritoLocalId: distritosLocalesMap.get("13"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Mulege"),
    },
    {
      nombre: "92",
      distritoLocalId: distritosLocalesMap.get("14"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Mulege"),
    },
    {
      nombre: "93",
      distritoLocalId: distritosLocalesMap.get("14"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Mulege"),
    },
    {
      nombre: "94",
      distritoLocalId: distritosLocalesMap.get("14"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Mulege"),
    },
    {
      nombre: "95",
      distritoLocalId: distritosLocalesMap.get("14"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Mulege"),
    },
    {
      nombre: "96",
      distritoLocalId: distritosLocalesMap.get("14"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Mulege"),
    },
    {
      nombre: "97",
      distritoLocalId: distritosLocalesMap.get("14"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Mulege"),
    },
    {
      nombre: "98",
      distritoLocalId: distritosLocalesMap.get("14"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Mulege"),
    },
    {
      nombre: "99",
      distritoLocalId: distritosLocalesMap.get("14"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Mulege"),
    },
    {
      nombre: "101",
      distritoLocalId: distritosLocalesMap.get("14"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Mulege"),
    },
    {
      nombre: "102",
      distritoLocalId: distritosLocalesMap.get("14"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Mulege"),
    },
    {
      nombre: "103",
      distritoLocalId: distritosLocalesMap.get("14"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Mulege"),
    },
    {
      nombre: "105",
      distritoLocalId: distritosLocalesMap.get("14"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Mulege"),
    },
    {
      nombre: "107",
      distritoLocalId: distritosLocalesMap.get("14"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Mulege"),
    },
    {
      nombre: "108",
      distritoLocalId: distritosLocalesMap.get("14"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Mulege"),
    },
    {
      nombre: "109",
      distritoLocalId: distritosLocalesMap.get("14"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Mulege"),
    },
    {
      nombre: "110",
      distritoLocalId: distritosLocalesMap.get("14"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Mulege"),
    },
    {
      nombre: "111",
      distritoLocalId: distritosLocalesMap.get("14"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Mulege"),
    },
    {
      nombre: "112",
      distritoLocalId: distritosLocalesMap.get("14"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Mulege"),
    },
    {
      nombre: "113",
      distritoLocalId: distritosLocalesMap.get("14"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Mulege"),
    },
    {
      nombre: "114",
      distritoLocalId: distritosLocalesMap.get("14"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Mulege"),
    },
    {
      nombre: "115",
      distritoLocalId: distritosLocalesMap.get("14"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Mulege"),
    },
    {
      nombre: "116",
      distritoLocalId: distritosLocalesMap.get("14"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Mulege"),
    },
    {
      nombre: "117",
      distritoLocalId: distritosLocalesMap.get("14"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Mulege"),
    },
    {
      nombre: "118",
      distritoLocalId: distritosLocalesMap.get("13"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Mulege"),
    },
    {
      nombre: "119",
      distritoLocalId: distritosLocalesMap.get("14"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Mulege"),
    },
    {
      nombre: "120",
      distritoLocalId: distritosLocalesMap.get("14"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Mulege"),
    },
    {
      nombre: "121",
      distritoLocalId: distritosLocalesMap.get("6"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "122",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "123",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "124",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "125",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "126",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "127",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "128",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "129",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "130",
      distritoLocalId: distritosLocalesMap.get("6"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "131",
      distritoLocalId: distritosLocalesMap.get("6"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "132",
      distritoLocalId: distritosLocalesMap.get("6"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "133",
      distritoLocalId: distritosLocalesMap.get("6"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "134",
      distritoLocalId: distritosLocalesMap.get("6"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "135",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "136",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "137",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "138",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "139",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "140",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "141",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "142",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "143",
      distritoLocalId: distritosLocalesMap.get("6"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "144",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "145",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "146",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "147",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "148",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "149",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "150",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "151",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "152",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "153",
      distritoLocalId: distritosLocalesMap.get("6"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "154",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "155",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "156",
      distritoLocalId: distritosLocalesMap.get("6"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "157",
      distritoLocalId: distritosLocalesMap.get("6"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "158",
      distritoLocalId: distritosLocalesMap.get("6"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "159",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "160",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "161",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "162",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "163",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "164",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "165",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "166",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "167",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "168",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "169",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "170",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "171",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "172",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "173",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "174",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "175",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "176",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "177",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "178",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "179",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "180",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "181",
      distritoLocalId: distritosLocalesMap.get("4"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "182",
      distritoLocalId: distritosLocalesMap.get("4"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "183",
      distritoLocalId: distritosLocalesMap.get("4"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "184",
      distritoLocalId: distritosLocalesMap.get("5"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "185",
      distritoLocalId: distritosLocalesMap.get("5"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "186",
      distritoLocalId: distritosLocalesMap.get("5"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "187",
      distritoLocalId: distritosLocalesMap.get("5"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "188",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "189",
      distritoLocalId: distritosLocalesMap.get("5"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "190",
      distritoLocalId: distritosLocalesMap.get("15"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "191",
      distritoLocalId: distritosLocalesMap.get("15"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "192",
      distritoLocalId: distritosLocalesMap.get("15"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "193",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "194",
      distritoLocalId: distritosLocalesMap.get("15"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "195",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "196",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "197",
      distritoLocalId: distritosLocalesMap.get("15"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "198",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "199",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "200",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "201",
      distritoLocalId: distritosLocalesMap.get("2"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "202",
      distritoLocalId: distritosLocalesMap.get("15"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "203",
      distritoLocalId: distritosLocalesMap.get("4"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "204",
      distritoLocalId: distritosLocalesMap.get("4"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "205",
      distritoLocalId: distritosLocalesMap.get("4"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "207",
      distritoLocalId: distritosLocalesMap.get("5"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "208",
      distritoLocalId: distritosLocalesMap.get("5"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "209",
      distritoLocalId: distritosLocalesMap.get("5"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "210",
      distritoLocalId: distritosLocalesMap.get("5"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "211",
      distritoLocalId: distritosLocalesMap.get("15"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "212",
      distritoLocalId: distritosLocalesMap.get("15"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "213",
      distritoLocalId: distritosLocalesMap.get("15"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "214",
      distritoLocalId: distritosLocalesMap.get("15"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "215",
      distritoLocalId: distritosLocalesMap.get("15"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "216",
      distritoLocalId: distritosLocalesMap.get("15"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "217",
      distritoLocalId: distritosLocalesMap.get("15"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "218",
      distritoLocalId: distritosLocalesMap.get("5"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "219",
      distritoLocalId: distritosLocalesMap.get("15"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "220",
      distritoLocalId: distritosLocalesMap.get("15"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "221",
      distritoLocalId: distritosLocalesMap.get("15"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "222",
      distritoLocalId: distritosLocalesMap.get("15"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "223",
      distritoLocalId: distritosLocalesMap.get("15"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "224",
      distritoLocalId: distritosLocalesMap.get("15"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "225",
      distritoLocalId: distritosLocalesMap.get("15"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "226",
      distritoLocalId: distritosLocalesMap.get("15"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "227",
      distritoLocalId: distritosLocalesMap.get("15"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "228",
      distritoLocalId: distritosLocalesMap.get("15"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "229",
      distritoLocalId: distritosLocalesMap.get("15"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "230",
      distritoLocalId: distritosLocalesMap.get("15"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "231",
      distritoLocalId: distritosLocalesMap.get("15"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "232",
      distritoLocalId: distritosLocalesMap.get("15"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "233",
      distritoLocalId: distritosLocalesMap.get("15"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "234",
      distritoLocalId: distritosLocalesMap.get("15"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "235",
      distritoLocalId: distritosLocalesMap.get("15"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "236",
      distritoLocalId: distritosLocalesMap.get("15"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "237",
      distritoLocalId: distritosLocalesMap.get("15"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "238",
      distritoLocalId: distritosLocalesMap.get("15"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "239",
      distritoLocalId: distritosLocalesMap.get("15"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "240",
      distritoLocalId: distritosLocalesMap.get("15"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "241",
      distritoLocalId: distritosLocalesMap.get("15"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "242",
      distritoLocalId: distritosLocalesMap.get("15"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "243",
      distritoLocalId: distritosLocalesMap.get("15"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "244",
      distritoLocalId: distritosLocalesMap.get("15"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "245",
      distritoLocalId: distritosLocalesMap.get("15"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "246",
      distritoLocalId: distritosLocalesMap.get("15"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "247",
      distritoLocalId: distritosLocalesMap.get("15"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "248",
      distritoLocalId: distritosLocalesMap.get("15"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "249",
      distritoLocalId: distritosLocalesMap.get("4"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "250",
      distritoLocalId: distritosLocalesMap.get("15"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "251",
      distritoLocalId: distritosLocalesMap.get("15"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "254",
      distritoLocalId: distritosLocalesMap.get("6"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "255",
      distritoLocalId: distritosLocalesMap.get("6"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "256",
      distritoLocalId: distritosLocalesMap.get("5"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "257",
      distritoLocalId: distritosLocalesMap.get("5"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "258",
      distritoLocalId: distritosLocalesMap.get("5"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "259",
      distritoLocalId: distritosLocalesMap.get("5"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "260",
      distritoLocalId: distritosLocalesMap.get("5"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "261",
      distritoLocalId: distritosLocalesMap.get("5"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "262",
      distritoLocalId: distritosLocalesMap.get("5"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "263",
      distritoLocalId: distritosLocalesMap.get("5"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "264",
      distritoLocalId: distritosLocalesMap.get("5"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "265",
      distritoLocalId: distritosLocalesMap.get("5"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "266",
      distritoLocalId: distritosLocalesMap.get("5"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "267",
      distritoLocalId: distritosLocalesMap.get("6"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "268",
      distritoLocalId: distritosLocalesMap.get("6"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "269",
      distritoLocalId: distritosLocalesMap.get("6"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "270",
      distritoLocalId: distritosLocalesMap.get("6"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "271",
      distritoLocalId: distritosLocalesMap.get("6"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "272",
      distritoLocalId: distritosLocalesMap.get("6"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "273",
      distritoLocalId: distritosLocalesMap.get("6"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "274",
      distritoLocalId: distritosLocalesMap.get("6"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "276",
      distritoLocalId: distritosLocalesMap.get("6"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "277",
      distritoLocalId: distritosLocalesMap.get("6"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "278",
      distritoLocalId: distritosLocalesMap.get("6"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "280",
      distritoLocalId: distritosLocalesMap.get("6"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "281",
      distritoLocalId: distritosLocalesMap.get("6"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "282",
      distritoLocalId: distritosLocalesMap.get("6"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "283",
      distritoLocalId: distritosLocalesMap.get("6"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "284",
      distritoLocalId: distritosLocalesMap.get("6"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "286",
      distritoLocalId: distritosLocalesMap.get("6"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "287",
      distritoLocalId: distritosLocalesMap.get("6"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "288",
      distritoLocalId: distritosLocalesMap.get("5"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "289",
      distritoLocalId: distritosLocalesMap.get("5"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "290",
      distritoLocalId: distritosLocalesMap.get("1"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "291",
      distritoLocalId: distritosLocalesMap.get("1"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "292",
      distritoLocalId: distritosLocalesMap.get("1"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "293",
      distritoLocalId: distritosLocalesMap.get("1"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "294",
      distritoLocalId: distritosLocalesMap.get("1"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "295",
      distritoLocalId: distritosLocalesMap.get("1"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "296",
      distritoLocalId: distritosLocalesMap.get("1"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "297",
      distritoLocalId: distritosLocalesMap.get("1"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "299",
      distritoLocalId: distritosLocalesMap.get("1"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "300",
      distritoLocalId: distritosLocalesMap.get("1"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "302",
      distritoLocalId: distritosLocalesMap.get("1"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "303",
      distritoLocalId: distritosLocalesMap.get("12"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "304",
      distritoLocalId: distritosLocalesMap.get("12"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "305",
      distritoLocalId: distritosLocalesMap.get("12"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "306",
      distritoLocalId: distritosLocalesMap.get("12"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "307",
      distritoLocalId: distritosLocalesMap.get("12"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "308",
      distritoLocalId: distritosLocalesMap.get("12"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "309",
      distritoLocalId: distritosLocalesMap.get("12"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "310",
      distritoLocalId: distritosLocalesMap.get("12"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "311",
      distritoLocalId: distritosLocalesMap.get("12"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "313",
      distritoLocalId: distritosLocalesMap.get("12"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "315",
      distritoLocalId: distritosLocalesMap.get("1"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "316",
      distritoLocalId: distritosLocalesMap.get("11"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "317",
      distritoLocalId: distritosLocalesMap.get("11"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "318",
      distritoLocalId: distritosLocalesMap.get("16"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "319",
      distritoLocalId: distritosLocalesMap.get("16"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "320",
      distritoLocalId: distritosLocalesMap.get("16"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "321",
      distritoLocalId: distritosLocalesMap.get("16"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "322",
      distritoLocalId: distritosLocalesMap.get("16"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "323",
      distritoLocalId: distritosLocalesMap.get("16"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "324",
      distritoLocalId: distritosLocalesMap.get("11"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "325",
      distritoLocalId: distritosLocalesMap.get("11"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "326",
      distritoLocalId: distritosLocalesMap.get("11"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "327",
      distritoLocalId: distritosLocalesMap.get("16"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "328",
      distritoLocalId: distritosLocalesMap.get("16"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "329",
      distritoLocalId: distritosLocalesMap.get("16"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "331",
      distritoLocalId: distritosLocalesMap.get("16"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "333",
      distritoLocalId: distritosLocalesMap.get("16"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "334",
      distritoLocalId: distritosLocalesMap.get("11"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "335",
      distritoLocalId: distritosLocalesMap.get("16"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "336",
      distritoLocalId: distritosLocalesMap.get("16"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "338",
      distritoLocalId: distritosLocalesMap.get("13"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Loreto"),
    },
    {
      nombre: "339",
      distritoLocalId: distritosLocalesMap.get("13"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Loreto"),
    },
    {
      nombre: "340",
      distritoLocalId: distritosLocalesMap.get("13"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Loreto"),
    },
    {
      nombre: "341",
      distritoLocalId: distritosLocalesMap.get("13"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Loreto"),
    },
    {
      nombre: "342",
      distritoLocalId: distritosLocalesMap.get("13"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Loreto"),
    },
    {
      nombre: "343",
      distritoLocalId: distritosLocalesMap.get("13"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Loreto"),
    },
    {
      nombre: "344",
      distritoLocalId: distritosLocalesMap.get("13"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Loreto"),
    },
    {
      nombre: "345",
      distritoLocalId: distritosLocalesMap.get("13"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Loreto"),
    },
    {
      nombre: "346",
      distritoLocalId: distritosLocalesMap.get("13"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Loreto"),
    },
    {
      nombre: "347",
      distritoLocalId: distritosLocalesMap.get("13"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("Loreto"),
    },
    {
      nombre: "348",
      distritoLocalId: distritosLocalesMap.get("5"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "349",
      distritoLocalId: distritosLocalesMap.get("5"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "350",
      distritoLocalId: distritosLocalesMap.get("5"),
      distritoFederalId: distritosFederalesMap.get("1"),
      municipioId: municipiosMap.get("La Paz"),
    },
    {
      nombre: "351",
      distritoLocalId: distritosLocalesMap.get("16"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "352",
      distritoLocalId: distritosLocalesMap.get("16"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "354",
      distritoLocalId: distritosLocalesMap.get("11"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "355",
      distritoLocalId: distritosLocalesMap.get("11"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "356",
      distritoLocalId: distritosLocalesMap.get("8"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "357",
      distritoLocalId: distritosLocalesMap.get("8"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "358",
      distritoLocalId: distritosLocalesMap.get("8"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "359",
      distritoLocalId: distritosLocalesMap.get("8"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "360",
      distritoLocalId: distritosLocalesMap.get("8"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "361",
      distritoLocalId: distritosLocalesMap.get("8"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "362",
      distritoLocalId: distritosLocalesMap.get("8"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "363",
      distritoLocalId: distritosLocalesMap.get("8"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "364",
      distritoLocalId: distritosLocalesMap.get("8"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "365",
      distritoLocalId: distritosLocalesMap.get("8"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "366",
      distritoLocalId: distritosLocalesMap.get("8"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "367",
      distritoLocalId: distritosLocalesMap.get("11"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "368",
      distritoLocalId: distritosLocalesMap.get("11"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "369",
      distritoLocalId: distritosLocalesMap.get("11"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "370",
      distritoLocalId: distritosLocalesMap.get("11"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "371",
      distritoLocalId: distritosLocalesMap.get("11"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "372",
      distritoLocalId: distritosLocalesMap.get("11"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
    {
      nombre: "373",
      distritoLocalId: distritosLocalesMap.get("11"),
      distritoFederalId: distritosFederalesMap.get("2"),
      municipioId: municipiosMap.get("Los Cabos"),
    },
  ];

  console.log(`Intentando crear ${seccionesData.length} secciones...`);

  // Crear las secciones en la base de datos
  for (const seccion of seccionesData) {
    try {
      await prisma.seccion.create({
        data: seccion,
      });
    } catch (error) {
      console.error(`Error al crear la sección ${seccion.nombre}:`, error);
    }
  }

  // Verificar y crear casillas si no existen
  const casillas = await prisma.casilla.findMany();
  if (casillas.length === 0) {
    console.log("No se encontraron casillas. Creando casillas...");
    const numeros = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32,
      33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62,
      67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96,
      97, 98, 99, 101, 102, 103, 105, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 496, 497, 498,
      499, 500, 501, 502, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140,
      141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164,
      165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188,
      189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 207, 208, 209, 210, 211, 212, 213,
      214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237,
      238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263,
      264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 276, 277, 278, 280, 281, 282, 283, 284, 286, 287, 288, 289, 348,
      349, 350, 440, 441, 442, 443, 444, 445, 446, 447, 448, 449, 450, 451, 452, 453, 454, 455, 456, 457, 458, 459, 460, 461,
      462, 463, 464, 465, 466, 467, 468, 469, 470, 471, 472, 473, 474, 475, 476, 477, 478, 479, 480, 481, 482, 483, 484, 485,
      486, 487, 488, 489, 490, 491, 492, 493, 494, 495, 542, 543, 338, 339, 340, 341, 342, 343, 344, 345, 346, 347, 290, 291,
      292, 293, 294, 295, 296, 297, 299, 300, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311, 313, 315, 316, 317, 318, 319,
      320, 321, 322, 323, 324, 325, 326, 327, 328, 329, 331, 333, 334, 335, 336, 351, 352, 354, 355, 356, 357, 358, 359, 360,
      361, 362, 363, 364, 365, 366, 367, 368, 369, 370, 371, 372, 373, 374, 375, 376, 377, 378, 379, 380, 381, 382, 383, 384,
      385, 386, 387, 388, 389, 390, 391, 392, 393, 394, 395, 396, 397, 398, 399, 400, 401, 402, 403, 404, 405, 406, 407, 408,
      409, 410, 411, 413, 414, 415, 416, 417, 418, 419, 420, 421, 422, 423, 424, 425, 426, 427, 428, 429, 430, 431, 432, 433,
      434, 435, 436, 437, 438, 439, 503, 504, 505, 506, 507, 508, 509, 510, 511, 512, 513, 514, 515, 516, 517, 518, 519, 520,
      521, 522, 523, 524, 525, 526, 527, 528, 529, 530, 531, 532, 533, 534, 535, 536, 537, 538, 539, 540, 541, 544, 545, 546,
      547
    ];
    for (const numero of numeros) {
      const casillaNueva = { 
        numero: `${numero.toString()}`,
        direccion: "", 
        seccionId: Number(numero) };
      try {
        console.log(casillaNueva)
        await prisma.casilla.create({          
          data: casillaNueva,
        });
        console.log(`Casilla ${casillaNueva.numero} creada exitosamente.`);
      } catch (error) {
        console.error(`Error al crear la casilla ${casillaNueva.numero}:`, error);
      }
    }
    }

  console.log("Seed de secciones completado exitosamente.");

  
}


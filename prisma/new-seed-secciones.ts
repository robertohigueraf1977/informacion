import { PrismaClient } from "@prisma/client";
import { secciones } from "./seedsecciones";

const prisma = new PrismaClient();

export async function main() {
  try {
    console.log("🌱 Seeding secciones electorales...");

    // Count existing secciones to check if seeding is needed
    const existingSecciones = await prisma.seccion.count();
    
    if (existingSecciones > 0) {
      console.log("Secciones already exist in the database. Skipping secciones seeding.");
      return;
    }

    // Ensure municipalities exist
    const requiredMunicipioIds = [...new Set(secciones.map(seccion => seccion.municipioId))];
    for (const municipioId of requiredMunicipioIds) {
      const existingMunicipio = await prisma.municipio.findUnique({
        where: { id: municipioId }
      });

      if (!existingMunicipio) {
        await prisma.municipio.create({
          data: {
            id: municipioId,
            nombre: `Municipio ${municipioId}`
          }
        });
        console.log(`Created municipality with ID: ${municipioId}`);
      }
    }

    // Ensure local districts exist
    const requiredDistritoLocalIds = [...new Set(secciones.map(seccion => seccion.distritoLocalId))];
    for (const distritoLocalId of requiredDistritoLocalIds) {
      const existingDistritoLocal = await prisma.distritoLocal.findUnique({
        where: { id: distritoLocalId }
      });

      if (!existingDistritoLocal) {
        await prisma.distritoLocal.create({
          data: {
            id: distritoLocalId,
            nombre: `Distrito Local ${distritoLocalId}`
          }
        });
        console.log(`Created local district with ID: ${distritoLocalId}`);
      }
    }

    // Ensure federal districts exist
    const requiredDistritoFederalIds = [...new Set(secciones.map(seccion => seccion.distritoFederalId))];
    for (const distritoFederalId of requiredDistritoFederalIds) {
      const existingDistritoFederal = await prisma.distritoFederal.findUnique({
        where: { id: distritoFederalId }
      });

      if (!existingDistritoFederal) {
        await prisma.distritoFederal.create({
          data: {
            id: distritoFederalId,
            nombre: `Distrito Federal ${distritoFederalId}`
          }
        });
        console.log(`Created federal district with ID: ${distritoFederalId}`);
      }
    }

    // Create secciones in batches
    const batchSize = 100;
    let createdCount = 0;

    for (let i = 0; i < secciones.length; i += batchSize) {
      const batch = secciones.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async (seccion) => {
          try {
            await prisma.seccion.create({
              data: {
                nombre: seccion.nombre.toString(),
                municipioId: seccion.municipioId,
                distritoLocalId: seccion.distritoLocalId,
                distritoFederalId: seccion.distritoFederalId
              }
            });
            createdCount++;
          } catch (error) {
            console.error(`Error creating seccion ${seccion.nombre}:`, error);
          }
        })
      );
      
      console.log(`Processed ${Math.min(i + batchSize, secciones.length)} of ${secciones.length} secciones`);
    }

    console.log(`✅ Successfully seeded ${createdCount} secciones electorales`);

  } catch (error) {
    console.error("❌ Error seeding secciones:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeder if this script is executed directly
if (require.main === module) {
  main()
    .then(() => console.log("✅ Secciones seeding completed successfully"))
    .catch((e) => {
      console.error("❌ Error seeding secciones:", e);
      process.exit(1);
    })
    .finally(() => process.exit(0));
}


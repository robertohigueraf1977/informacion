import { PrismaClient } from "@prisma/client";
import { casillas } from "./seedcasillas";

const prisma = new PrismaClient();

export async function main() {
  try {
    console.log("🌱 Seeding casillas electorales...");

    // Count existing casillas to check if seeding is needed
    const existingCasillas = await prisma.casilla.count();
    
    if (existingCasillas > 0) {
      console.log("Casillas already exist in the database. Skipping casillas seeding.");
      return;
    }

    // Verify that secciones exist, as they are required for casillas
    const totalSecciones = await prisma.seccion.count();
    if (totalSecciones === 0) {
      console.error("No secciones found in the database. Secciones must be seeded before casillas.");
      return;
    }

    // Create casillas in batches
    const batchSize = 100;
    let createdCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < casillas.length; i += batchSize) {
      const batch = casillas.slice(i, i + batchSize);
      
      // Process each casilla in the batch
      await Promise.all(
        batch.map(async (casilla) => {
          try {
            // Check if the corresponding seccion exists
            const seccion = await prisma.seccion.findFirst({
              where: {
                nombre: casilla.seccionId.toString()
              }
            });

            if (!seccion) {
              console.warn(`Skipping casilla ${casilla.numero}: No matching seccion with nombre '${casilla.seccionId}'`);
              skippedCount++;
              return;
            }

            // Create the casilla with the correct seccionId
            await prisma.casilla.create({
              data: {
                numero: casilla.numero.toString(),
                direccion: casilla.direccion,
                seccionId: seccion.id
              }
            });
            createdCount++;
          } catch (error) {
            console.error(`Error creating casilla ${casilla.numero}:`, error);
            skippedCount++;
          }
        })
      );
      
      console.log(`Processed ${Math.min(i + batchSize, casillas.length)} of ${casillas.length} casillas`);
    }

    console.log(`✅ Successfully seeded ${createdCount} casillas electorales (skipped: ${skippedCount})`);

  } catch (error) {
    console.error("❌ Error seeding casillas:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeder if this script is executed directly
if (require.main === module) {
  main()
    .then(() => console.log("✅ Casillas seeding completed successfully"))
    .catch((e) => {
      console.error("❌ Error seeding casillas:", e);
      process.exit(1);
    })
    .finally(() => process.exit(0));
}


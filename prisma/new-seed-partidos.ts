import { PrismaClient } from "@prisma/client";
import { partidos } from "./seedpartidos";

const prisma = new PrismaClient();

export async function main() {
  try {
    console.log("🌱 Seeding partidos políticos...");

    // Count existing parties to check if seeding is needed
    const existingPartidos = await prisma.partido.count();
    
    if (existingPartidos > 0) {
      console.log("Partidos already exist in the database. Skipping party seeding.");
      return;
    }

    // Create all partidos
    const createdPartidos = await Promise.all(
      partidos.map(async (partido) => {
        return await prisma.partido.create({
          data: {
            nombre: partido.nombre,
            siglas: partido.siglas
          }
        });
      })
    );

    console.log(`✅ Successfully seeded ${createdPartidos.length} partidos políticos`);

  } catch (error) {
    console.error("❌ Error seeding partidos:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeder if this script is executed directly
if (require.main === module) {
  main()
    .then(() => console.log("✅ Partidos seeding completed successfully"))
    .catch((e) => {
      console.error("❌ Error seeding partidos:", e);
      process.exit(1);
    })
    .finally(() => process.exit(0));
}


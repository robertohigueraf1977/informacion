import { main as seedMain } from './seed';
import { main as seedPartidos } from './new-seed-partidos';
import { main as seedSecciones } from './new-seed-secciones';
import { main as seedCasillas } from './new-seed-casillas';

async function seedAll() {
  try {
    console.log('🌱 Starting the seeding process...');
    
    // Run the main seed script first (user)
    console.log('🌱 Running main seed script (usuarios)...');
    await seedMain();
    console.log('✅ Main seed completed successfully');
    
    // Run new-seed-partidos.ts
    console.log('🌱 Running seed de partidos...');
    await seedPartidos();
    console.log('✅ Seed de partidos completed successfully');
    
    // Run new-seed-secciones.ts
    console.log('🌱 Running seed de secciones...');
    await seedSecciones();
    console.log('✅ Seed de secciones completed successfully');
    
    // Run new-seed-casillas.ts
    console.log('🌱 Running seed de casillas...');
    await seedCasillas();
    console.log('✅ Seed de casillas completed successfully');
    
    console.log('🎉 All seed scripts completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding process:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the seedAll function
seedAll();


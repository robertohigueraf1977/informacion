import { main as seedMain } from './seed';
import { main as seedSecciones } from './seed-secciones';
import { main as seedSeccionesReales } from './seed-secciones-reales';
import { main as seedSeccionesEspecificas } from './seed-secciones-especificas';

async function seedAll() {
  try {
    console.log('🌱 Starting the seeding process...');
    
    // Run the main seed script first
    console.log('🌱 Running main seed script...');
    await seedMain();
    console.log('✅ Main seed completed successfully');
    
    // Run seed-secciones.ts
    console.log('🌱 Running seed-secciones...');
    await seedSecciones();
    console.log('✅ seed-secciones completed successfully');
    
    // Run seed-secciones-reales.ts
    console.log('🌱 Running seed-secciones-reales...');
    await seedSeccionesReales();
    console.log('✅ seed-secciones-reales completed successfully');
    
    // Run seed-secciones-especificas.ts
    console.log('🌱 Running seed-secciones-especificas...');
    await seedSeccionesEspecificas();
    console.log('✅ seed-secciones-especificas completed successfully');
    
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


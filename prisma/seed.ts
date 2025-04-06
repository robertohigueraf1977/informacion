import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  try {
    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: {
        username: "Rhiguera",
      },
    });

    if (existingUser) {
      console.log("El usuario Rhiguera ya existe. Actualizando contraseña...");

      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash("Hivl090621", 10);

      // Actualizar el usuario existente
      await prisma.user.update({
        where: {
          username: "Rhiguera",
        },
        data: {
          password: hashedPassword,
          role: UserRole.SUPER_USER,
        },
      });

      console.log("Contraseña actualizada y rol establecido como SUPER_USER");
    } else {
      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash("Hivl090621", 10);

      // Crear el superusuario
      await prisma.user.create({
        data: {
          name: "Administrador",
          username: "Rhiguera",
          email: "admin@sistema-electoral.com",
          password: hashedPassword,
          role: UserRole.SUPER_USER,
        },
      });

      console.log("Superusuario Rhiguera creado exitosamente");
    }
  } catch (error) {
    console.error("Error al crear/actualizar el superusuario:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

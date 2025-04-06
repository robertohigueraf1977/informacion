import { NextResponse } from "next/server";
import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: {
        username: "Rhiguera",
      },
    });

    if (existingUser) {
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

      return NextResponse.json({
        success: true,
        message: "Superusuario actualizado exitosamente",
      });
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

      return NextResponse.json({
        success: true,
        message: "Superusuario creado exitosamente",
      });
    }
  } catch (error) {
    console.error("Error al crear/actualizar el superusuario:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error al crear/actualizar el superusuario",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

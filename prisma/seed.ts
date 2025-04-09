import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

export async function main() {
  try {
    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username: "Rhiguera" }, { email: "roberto@example.com" }],
      },
    })

    if (existingUser) {
      console.log("El superusuario ya existe. No se creará uno nuevo.")
      return
    }

    // Crear el superusuario
    const hashedPassword = await hash("Hivl090621", 10)

    const superUser = await prisma.user.create({
      data: {
        name: "Roberto",
        username: "Rhiguera",
        email: "roberto@example.com",
        password: hashedPassword,
        role: "SUPER_USER",
      },
    })

    console.log("Superusuario creado exitosamente:")
    console.log({
      id: superUser.id,
      name: superUser.name,
      username: superUser.username,
      email: superUser.email,
      role: superUser.role,
    })
  } catch (error) {
    console.error("Error al crear el superusuario:", error)
  } finally {
    await prisma.$disconnect()
  }
}


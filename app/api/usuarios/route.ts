import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { UserRole } from "@prisma/client"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    // Verificar si el usuario está autenticado y es SUPER_USER
    if (!session?.user || session.user.role !== UserRole.SUPER_USER) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const usuarios = await db.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        municipio: {
          select: {
            nombre: true,
          },
        },
      },
    })

    return NextResponse.json(usuarios)
  } catch (error) {
    console.error("Error al obtener usuarios:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar si el usuario está autenticado y es SUPER_USER
    if (!session?.user || session.user.role !== UserRole.SUPER_USER) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await req.json()
    const { name, username, email, password, role, municipioId } = body

    if (!name || !username || !password) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    // Verificar si el usuario ya existe
    const existingUser = await db.user.findFirst({
      where: {
        OR: [{ username }, { email: email || undefined }],
      },
    })

    if (existingUser) {
      return NextResponse.json({ error: "El nombre de usuario o correo electrónico ya está en uso" }, { status: 400 })
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Crear el usuario
    const user = await db.user.create({
      data: {
        name,
        username,
        email: email || null,
        password: hashedPassword,
        role: role as UserRole,
        municipioId: municipioId || null,
      },
    })

    // Eliminar la contraseña de la respuesta
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error) {
    console.error("Error al crear usuario:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar si el usuario está autenticado y es SUPER_USER
    if (!session?.user || session.user.role !== UserRole.SUPER_USER) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Implementar la lógica para actualizar un usuario aquí
    // ...

    return NextResponse.json({ message: "Usuario actualizado" }, { status: 200 })
  } catch (error) {
    console.error("Error al actualizar usuario:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar si el usuario está autenticado y es SUPER_USER
    if (!session?.user || session.user.role !== UserRole.SUPER_USER) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Implementar la lógica para eliminar un usuario aquí
    // ...

    return NextResponse.json({ message: "Usuario eliminado" }, { status: 200 })
  } catch (error) {
    console.error("Error al eliminar usuario:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

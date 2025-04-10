import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authOptions } from "@/auth";
import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Verificar si el usuario está autenticado y es SUPER_USER
    if (!session?.user || session.user.role !== UserRole.SUPER_USER) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const id = params.id;

    const usuario = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        municipioId: true,
        municipio: {
          select: {
            nombre: true,
          },
        },
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(usuario);
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Verificar si el usuario está autenticado y es SUPER_USER
    if (!session?.user || session.user.role !== UserRole.SUPER_USER) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const id = params.id;
    const body = await req.json();
    const { name, username, email, password, role, municipioId } = body;

    if (!name || !username) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Verificar si el usuario existe
    const existingUser = await db.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si el username o email ya están en uso por otro usuario
    const duplicateUser = await db.user.findFirst({
      where: {
        OR: [
          { username, NOT: { id } },
          { email, NOT: { id } },
        ],
      },
    });

    if (duplicateUser) {
      return NextResponse.json(
        { error: "El nombre de usuario o correo electrónico ya está en uso" },
        { status: 400 }
      );
    }

    // Preparar los datos para actualizar
    const updateData: any = {
      name,
      username,
      email: email || null,
      role: role as UserRole,
      municipioId: municipioId || null,
    };

    // Si se proporciona una nueva contraseña, encriptarla
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Actualizar el usuario
    const updatedUser = await db.user.update({
      where: { id },
      data: updateData,
    });

    // Eliminar la contraseña de la respuesta
    const { password: _, ...userWithoutPassword } = updatedUser;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Verificar si el usuario está autenticado y es SUPER_USER
    if (!session?.user || session.user.role !== UserRole.SUPER_USER) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const id = params.id;

    // Verificar si el usuario existe
    const existingUser = await db.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // No permitir eliminar al propio usuario
    if (id === session.user.id) {
      return NextResponse.json(
        { error: "No puedes eliminar tu propio usuario" },
        { status: 400 }
      );
    }

    // Eliminar el usuario
    await db.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

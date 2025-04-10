import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Verificar si el usuario está autenticado
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const id = Number.parseInt(params.id);

    const distritoLocal = await db.distritoLocal.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        secciones: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    if (!distritoLocal) {
      return NextResponse.json(
        { error: "Distrito local no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(distritoLocal);
  } catch (error) {
    console.error("Error al obtener distrito local:", error);
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

    // Verificar si el usuario está autenticado
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const id = Number.parseInt(params.id);
    const body = await req.json();
    const { nombre } = body;

    if (!nombre) {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 }
      );
    }

    // Verificar si el distrito local existe
    const existingDistritoLocal = await db.distritoLocal.findUnique({
      where: { id },
    });

    if (!existingDistritoLocal) {
      return NextResponse.json(
        { error: "Distrito local no encontrado" },
        { status: 404 }
      );
    }

    // Actualizar el distrito local
    const distritoLocal = await db.distritoLocal.update({
      where: { id },
      data: {
        nombre,
      },
    });

    return NextResponse.json(distritoLocal);
  } catch (error) {
    console.error("Error al actualizar distrito local:", error);
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

    // Verificar si el usuario está autenticado
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const id = Number.parseInt(params.id);

    // Verificar si el distrito local existe
    const existingDistritoLocal = await db.distritoLocal.findUnique({
      where: { id },
      include: {
        secciones: true,
        usuarios: true,
      },
    });

    if (!existingDistritoLocal) {
      return NextResponse.json(
        { error: "Distrito local no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si tiene entidades relacionadas
    if (
      existingDistritoLocal.secciones.length > 0 ||
      existingDistritoLocal.usuarios.length > 0
    ) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar el distrito local porque tiene secciones o usuarios asociados. Elimine primero esas entidades.",
        },
        { status: 400 }
      );
    }

    // Eliminar el distrito local
    await db.distritoLocal.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar distrito local:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

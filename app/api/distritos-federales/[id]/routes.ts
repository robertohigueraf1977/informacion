import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
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

    const distritoFederal = await db.distritoFederal.findUnique({
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

    if (!distritoFederal) {
      return NextResponse.json(
        { error: "Distrito federal no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(distritoFederal);
  } catch (error) {
    console.error("Error al obtener distrito federal:", error);
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

    // Verificar si el distrito federal existe
    const existingDistritoFederal = await db.distritoFederal.findUnique({
      where: { id },
    });

    if (!existingDistritoFederal) {
      return NextResponse.json(
        { error: "Distrito federal no encontrado" },
        { status: 404 }
      );
    }

    // Actualizar el distrito federal
    const distritoFederal = await db.distritoFederal.update({
      where: { id },
      data: {
        nombre,
      },
    });

    return NextResponse.json(distritoFederal);
  } catch (error) {
    console.error("Error al actualizar distrito federal:", error);
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

    // Verificar si el distrito federal existe
    const existingDistritoFederal = await db.distritoFederal.findUnique({
      where: { id },
      include: {
        secciones: true,
        usuarios: true,
      },
    });

    if (!existingDistritoFederal) {
      return NextResponse.json(
        { error: "Distrito federal no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si tiene entidades relacionadas
    if (
      existingDistritoFederal.secciones.length > 0 ||
      existingDistritoFederal.usuarios.length > 0
    ) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar el distrito federal porque tiene secciones o usuarios asociados. Elimine primero esas entidades.",
        },
        { status: 400 }
      );
    }

    // Eliminar el distrito federal
    await db.distritoFederal.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar distrito federal:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

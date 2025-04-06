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

    const municipio = await db.municipio.findUnique({
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

    if (!municipio) {
      return NextResponse.json(
        { error: "Municipio no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(municipio);
  } catch (error) {
    console.error("Error al obtener municipio:", error);
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
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Verificar si el municipio existe
    const existingMunicipio = await db.municipio.findUnique({
      where: { id },
    });

    if (!existingMunicipio) {
      return NextResponse.json(
        { error: "Municipio no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si ya existe otro municipio con el mismo nombre
    const duplicateMunicipio = await db.municipio.findFirst({
      where: {
        nombre,
        NOT: {
          id,
        },
      },
    });

    if (duplicateMunicipio) {
      return NextResponse.json(
        { error: "Ya existe un municipio con ese nombre" },
        { status: 400 }
      );
    }

    // Actualizar el municipio
    const municipio = await db.municipio.update({
      where: { id },
      data: {
        nombre,
      },
    });

    return NextResponse.json(municipio);
  } catch (error) {
    console.error("Error al actualizar municipio:", error);
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

    // Verificar si el municipio existe
    const existingMunicipio = await db.municipio.findUnique({
      where: { id },
      include: {
        secciones: true,
      },
    });

    if (!existingMunicipio) {
      return NextResponse.json(
        { error: "Municipio no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si tiene entidades relacionadas
    if (existingMunicipio.secciones.length > 0) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar el municipio porque tiene secciones asociadas. Elimine primero esas entidades.",
        },
        { status: 400 }
      );
    }

    // Eliminar el municipio
    await db.municipio.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar municipio:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

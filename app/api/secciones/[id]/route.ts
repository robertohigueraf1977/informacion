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

    const seccion = await db.seccion.findUnique({
      where: { id },
      include: {
        municipio: true,
        distritoLocal: true,
        distritoFederal: true,
      },
    });

    if (!seccion) {
      return NextResponse.json(
        { error: "Sección no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(seccion);
  } catch (error) {
    console.error("Error al obtener sección:", error);
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
    const { nombre, municipioId, distritoLocalId, distritoFederalId } = body;

    if (!nombre || !municipioId) {
      return NextResponse.json(
        { error: "El nombre y el municipio son requeridos" },
        { status: 400 }
      );
    }

    // Verificar si la sección existe
    const existingSeccion = await db.seccion.findUnique({
      where: { id },
    });

    if (!existingSeccion) {
      return NextResponse.json(
        { error: "Sección no encontrada" },
        { status: 404 }
      );
    }

    // Verificar si ya existe otra sección con el mismo nombre en el mismo municipio
    const duplicateSeccion = await db.seccion.findFirst({
      where: {
        nombre,
        municipioId: Number(municipioId),
        NOT: {
          id,
        },
      },
    });

    if (duplicateSeccion) {
      return NextResponse.json(
        {
          error:
            "Ya existe una sección con ese nombre en el municipio seleccionado",
        },
        { status: 400 }
      );
    }

    // Actualizar la sección
    const seccion = await db.seccion.update({
      where: { id },
      data: {
        nombre,
        municipioId: Number(municipioId),
        distritoLocalId: distritoLocalId ? Number(distritoLocalId) : null,
        distritoFederalId: distritoFederalId ? Number(distritoFederalId) : null,
      },
    });

    return NextResponse.json(seccion);
  } catch (error) {
    console.error("Error al actualizar sección:", error);
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

    // Verificar si la sección existe
    const existingSeccion = await db.seccion.findUnique({
      where: { id },
      include: {
        personas: true,
        domicilios: true,
      },
    });

    if (!existingSeccion) {
      return NextResponse.json(
        { error: "Sección no encontrada" },
        { status: 404 }
      );
    }

    // Verificar si tiene entidades relacionadas
    if (
      existingSeccion.personas.length > 0 ||
      existingSeccion.domicilios.length > 0
    ) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar la sección porque tiene personas o domicilios asociados. Elimine primero esas entidades.",
        },
        { status: 400 }
      );
    }

    // Eliminar la sección
    await db.seccion.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar sección:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

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

    const sector = await db.sector.findUnique({
      where: { id },
      include: {
        personas: {
          select: {
            id: true,
            nombre: true,
            apellidoPaterno: true,
            apellidoMaterno: true,
          },
        },
      },
    });

    if (!sector) {
      return NextResponse.json(
        { error: "Sector no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(sector);
  } catch (error) {
    console.error("Error al obtener sector:", error);
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

    // Verificar si el sector existe
    const existingSector = await db.sector.findUnique({
      where: { id },
    });

    if (!existingSector) {
      return NextResponse.json(
        { error: "Sector no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si ya existe otro sector con el mismo nombre
    const duplicateSector = await db.sector.findFirst({
      where: {
        nombre,
        NOT: {
          id,
        },
      },
    });

    if (duplicateSector) {
      return NextResponse.json(
        { error: "Ya existe un sector con ese nombre" },
        { status: 400 }
      );
    }

    // Actualizar el sector
    const sector = await db.sector.update({
      where: { id },
      data: {
        nombre,
      },
    });

    return NextResponse.json(sector);
  } catch (error) {
    console.error("Error al actualizar sector:", error);
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

    // Verificar si el sector existe
    const existingSector = await db.sector.findUnique({
      where: { id },
      include: {
        personas: true,
      },
    });

    if (!existingSector) {
      return NextResponse.json(
        { error: "Sector no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si tiene personas asociadas
    if (existingSector.personas.length > 0) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar el sector porque tiene personas asociadas. Elimine primero esas entidades o cámbielas de sector.",
        },
        { status: 400 }
      );
    }

    // Eliminar el sector
    await db.sector.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar sector:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

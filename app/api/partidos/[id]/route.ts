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

    const partido = await db.partido.findUnique({
      where: { id },
      include: {
        votos: true,
      },
    });

    if (!partido) {
      return NextResponse.json(
        { error: "Partido no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(partido);
  } catch (error) {
    console.error("Error al obtener partido:", error);
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
    const { nombre, siglas } = body;

    if (!nombre || !siglas) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Verificar si el partido existe
    const existingPartido = await db.partido.findUnique({
      where: { id },
    });

    if (!existingPartido) {
      return NextResponse.json(
        { error: "Partido no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si ya existe otro partido con las mismas siglas
    const duplicatePartido = await db.partido.findFirst({
      where: {
        siglas,
        NOT: {
          id,
        },
      },
    });

    if (duplicatePartido) {
      return NextResponse.json(
        { error: "Ya existe un partido con esas siglas" },
        { status: 400 }
      );
    }

    // Actualizar el partido
    const partido = await db.partido.update({
      where: { id },
      data: {
        nombre,
        siglas,
      },
    });

    return NextResponse.json(partido);
  } catch (error) {
    console.error("Error al actualizar partido:", error);
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

    // Verificar si el partido existe
    const existingPartido = await db.partido.findUnique({
      where: { id },
      include: {
        votos: true,
      },
    });

    if (!existingPartido) {
      return NextResponse.json(
        { error: "Partido no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si tiene votos asociados
    if (existingPartido.votos.length > 0) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar el partido porque tiene votos asociados. Elimine primero los votos.",
        },
        { status: 400 }
      );
    }

    // Eliminar el partido
    await db.partido.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar partido:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

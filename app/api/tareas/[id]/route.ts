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

    const tarea = await db.tarea.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            name: true,
            username: true,
          },
        },
        persona: {
          select: {
            nombre: true,
            apellidoPaterno: true,
            apellidoMaterno: true,
          },
        },
      },
    });

    if (!tarea) {
      return NextResponse.json(
        { error: "Tarea no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(tarea);
  } catch (error) {
    console.error("Error al obtener tarea:", error);
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
    const { titulo, descripcion, fecha, completada, usuarioId, personaId } =
      body;

    if (!titulo) {
      return NextResponse.json(
        { error: "El título es requerido" },
        { status: 400 }
      );
    }

    // Verificar si la tarea existe
    const existingTarea = await db.tarea.findUnique({
      where: { id },
    });

    if (!existingTarea) {
      return NextResponse.json(
        { error: "Tarea no encontrada" },
        { status: 404 }
      );
    }

    // Actualizar la tarea
    const tarea = await db.tarea.update({
      where: { id },
      data: {
        titulo,
        descripcion: descripcion || null,
        ...(fecha ? { fecha: new Date(fecha) } : {}), // Only include 'fecha' if it's not null
        completada:
          completada !== undefined ? completada : existingTarea.completada,
        usuarioId: usuarioId || null,
        personaId: personaId ? Number(personaId) : null,
      },
    });

    return NextResponse.json(tarea);
  } catch (error) {
    console.error("Error al actualizar tarea:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    // Verificar si la tarea existe
    const existingTarea = await db.tarea.findUnique({
      where: { id },
    });

    if (!existingTarea) {
      return NextResponse.json(
        { error: "Tarea no encontrada" },
        { status: 404 }
      );
    }

    // Actualizar solo los campos proporcionados
    const tarea = await db.tarea.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(tarea);
  } catch (error) {
    console.error("Error al actualizar tarea:", error);
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

    // Verificar si la tarea existe
    const existingTarea = await db.tarea.findUnique({
      where: { id },
    });

    if (!existingTarea) {
      return NextResponse.json(
        { error: "Tarea no encontrada" },
        { status: 404 }
      );
    }

    // Eliminar la tarea
    await db.tarea.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar tarea:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

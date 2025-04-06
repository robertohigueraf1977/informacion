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

    const candidato = await db.candidato.findUnique({
      where: { id },
      include: {
        votos: true,
      },
    });

    if (!candidato) {
      return NextResponse.json(
        { error: "Candidato no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(candidato);
  } catch (error) {
    console.error("Error al obtener candidato:", error);
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
    const { nombre, cargo } = body;

    if (!nombre || !cargo) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Verificar si el candidato existe
    const existingCandidato = await db.candidato.findUnique({
      where: { id },
    });

    if (!existingCandidato) {
      return NextResponse.json(
        { error: "Candidato no encontrado" },
        { status: 404 }
      );
    }

    // Actualizar el candidato
    const candidato = await db.candidato.update({
      where: { id },
      data: {
        nombre,
        cargo,
      },
    });

    return NextResponse.json(candidato);
  } catch (error) {
    console.error("Error al actualizar candidato:", error);
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

    // Verificar si el candidato existe
    const existingCandidato = await db.candidato.findUnique({
      where: { id },
      include: {
        votos: true,
      },
    });

    if (!existingCandidato) {
      return NextResponse.json(
        { error: "Candidato no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si tiene votos asociados
    if (existingCandidato.votos.length > 0) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar el candidato porque tiene votos asociados. Elimine primero los votos.",
        },
        { status: 400 }
      );
    }

    // Eliminar el candidato
    await db.candidato.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar candidato:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

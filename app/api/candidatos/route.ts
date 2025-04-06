import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Verificar si el usuario está autenticado
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const candidatos = await db.candidato.findMany({
      select: {
        id: true,
        nombre: true,
        cargo: true,
        votos: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        nombre: "asc",
      },
    });

    return NextResponse.json(candidatos);
  } catch (error) {
    console.error("Error al obtener candidatos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Verificar si el usuario está autenticado
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await req.json();
    const { nombre, cargo } = body;

    if (!nombre || !cargo) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Crear el candidato
    const candidato = await db.candidato.create({
      data: {
        nombre,
        cargo,
      },
    });

    return NextResponse.json(candidato, { status: 201 });
  } catch (error) {
    console.error("Error al crear candidato:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

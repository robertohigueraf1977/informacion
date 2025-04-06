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

    const partidos = await db.partido.findMany({
      select: {
        id: true,
        nombre: true,
        siglas: true,
        votos: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        siglas: "asc",
      },
    });

    return NextResponse.json(partidos);
  } catch (error) {
    console.error("Error al obtener partidos:", error);
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
    const { nombre, siglas } = body;

    if (!nombre || !siglas) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Verificar si ya existe un partido con las mismas siglas
    const existingPartido = await db.partido.findFirst({
      where: {
        siglas,
      },
    });

    if (existingPartido) {
      return NextResponse.json(
        { error: "Ya existe un partido con esas siglas" },
        { status: 400 }
      );
    }

    // Crear el partido
    const partido = await db.partido.create({
      data: {
        nombre,
        siglas,
      },
    });

    return NextResponse.json(partido, { status: 201 });
  } catch (error) {
    console.error("Error al crear partido:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

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

    const casillas = await db.casilla.findMany({
      select: {
        id: true,
        numero: true,
        tipo: true,
        direccion: true,
        latitud: true,
        longitud: true,
        seccion: {
          select: {
            nombre: true,
            municipio: {
              select: {
                nombre: true,
              },
            },
          },
        },
        votos: {
          select: {
            id: true,
          },
        },
      },
      orderBy: [
        {
          seccion: {
            nombre: "asc",
          },
        },
        {
          numero: "asc",
        },
      ],
    });

    return NextResponse.json(casillas);
  } catch (error) {
    console.error("Error al obtener casillas:", error);
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
    const { nombre, tipo, seccionId, direccion, latitud, longitud } = body;

    if (!nombre || !tipo || !seccionId) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Verificar si la casilla ya existe en la misma sección
    const existingCasilla = await db.casilla.findFirst({
      where: {
        numero,
        seccionId: Number(seccionId),
      },
    });

    if (existingCasilla) {
      return NextResponse.json(
        {
          error:
            "Ya existe una casilla con ese nombre en la sección seleccionada",
        },
        { status: 400 }
      );
    }

    // Crear la casilla
    const casilla = await db.casilla.create({
      data: {
        numero,
        tipo,
        seccionId: Number(seccionId),
        direccion: direccion || null,
        latitud: latitud ? Number(latitud) : null,
        longitud: longitud ? Number(longitud) : null,
      },
    });

    return NextResponse.json(casilla, { status: 201 });
  } catch (error) {
    console.error("Error al crear casilla:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

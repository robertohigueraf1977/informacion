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

    const sectores = await db.sector.findMany({
      select: {
        id: true,
        nombre: true,
        personas: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        nombre: "asc",
      },
    });

    return NextResponse.json(sectores);
  } catch (error) {
    console.error("Error al obtener sectores:", error);
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
    const { nombre } = body;

    if (!nombre) {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 }
      );
    }

    // Verificar si el sector ya existe
    const existingSector = await db.sector.findFirst({
      where: {
        nombre,
      },
    });

    if (existingSector) {
      return NextResponse.json(
        { error: "Ya existe un sector con ese nombre" },
        { status: 400 }
      );
    }

    // Crear el sector
    const sector = await db.sector.create({
      data: {
        nombre,
      },
    });

    return NextResponse.json(sector, { status: 201 });
  } catch (error) {
    console.error("Error al crear sector:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

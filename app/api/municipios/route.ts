import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Verificar si el usuario está autenticado
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const municipios = await db.municipio.findMany({
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
      orderBy: {
        nombre: "asc",
      },
    });

    return NextResponse.json(municipios);
  } catch (error) {
    console.error("Error al obtener municipios:", error);
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
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Verificar si el municipio ya existe
    const existingMunicipio = await db.municipio.findFirst({
      where: {
        nombre,
      },
    });

    if (existingMunicipio) {
      return NextResponse.json(
        { error: "Ya existe un municipio con ese nombre" },
        { status: 400 }
      );
    }

    // Crear el municipio
    const municipio = await db.municipio.create({
      data: {
        nombre,
      },
    });

    return NextResponse.json(municipio, { status: 201 });
  } catch (error) {
    console.error("Error al crear municipio:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

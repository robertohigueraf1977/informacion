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

    const secciones = await db.seccion.findMany({
      select: {
        id: true,
        nombre: true,
        municipio: {
          select: {
            nombre: true,
          },
        },
        distritoLocal: {
          select: {
            nombre: true,
          },
        },
        distritoFederal: {
          select: {
            nombre: true,
          },
        },
      },
      orderBy: {
        nombre: "asc",
      },
    });

    return NextResponse.json(secciones);
  } catch (error) {
    console.error("Error al obtener secciones:", error);
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
    const { nombre, municipioId, distritoLocalId, distritoFederalId } = body;

    if (!nombre || !municipioId) {
      return NextResponse.json(
        { error: "El nombre y el municipio son requeridos" },
        { status: 400 }
      );
    }

    // Verificar si la sección ya existe en el mismo municipio
    const existingSeccion = await db.seccion.findFirst({
      where: {
        nombre,
        municipioId: Number(municipioId),
      },
    });

    if (existingSeccion) {
      return NextResponse.json(
        {
          error:
            "Ya existe una sección con ese nombre en el municipio seleccionado",
        },
        { status: 400 }
      );
    }

    // Crear la sección
    const seccion = await db.seccion.create({
      data: {
        nombre,
        municipioId: Number(municipioId),
        distritoLocalId: distritoLocalId ? Number(distritoLocalId) : null,
        distritoFederalId: distritoFederalId ? Number(distritoFederalId) : null,
      },
    });

    return NextResponse.json(seccion, { status: 201 });
  } catch (error) {
    console.error("Error al crear sección:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

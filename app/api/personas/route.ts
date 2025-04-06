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

    const personas = await db.persona.findMany({
      select: {
        id: true,
        nombre: true,
        apellidoPaterno: true,
        apellidoMaterno: true,
        telefono: true,
        email: true,
        referente: true,
        seccion: {
          select: {
            nombre: true,
          },
        },
        sector: {
          select: {
            nombre: true,
          },
        },
      },
      orderBy: [
        { apellidoPaterno: "asc" },
        { apellidoMaterno: "asc" },
        { nombre: "asc" },
      ],
    });

    return NextResponse.json(personas);
  } catch (error) {
    console.error("Error al obtener personas:", error);
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
    const {
      nombre,
      apellidoPaterno,
      apellidoMaterno,
      fechaNacimiento,
      curp,
      claveElector,
      seccionId,
      telefono,
      email,
      sectorId,
      referente,
      referidoPorId,
      // Domicilio
      calle,
      numero,
      colonia,
      localidad,
      codigoPostal,
      referencias,
      latitud,
      longitud,
    } = body;

    if (!nombre || !apellidoPaterno || !calle) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Crear la persona y su domicilio en una transacción
    const persona = await db.$transaction(async (tx) => {
      // Crear la persona
      const persona = await tx.persona.create({
        data: {
          nombre,
          apellidoPaterno,
          apellidoMaterno: apellidoMaterno || null,
          fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
          curp: curp || null,
          claveElector: claveElector || null,
          seccionId: seccionId || null,
          telefono: telefono || null,
          email: email || null,
          sectorId: sectorId || null,
          referente: referente || false,
          referidoPorId: referidoPorId || null,
        },
      });

      // Crear el domicilio asociado a la persona
      await tx.domicilio.create({
        data: {
          calle,
          numero: numero || null,
          colonia: colonia || null,
          localidad: localidad || null,
          codigoPostal: codigoPostal || null,
          referencias: referencias || null,
          latitud: latitud || null,
          longitud: longitud || null,
          personaId: persona.id,
          seccionId: seccionId || null,
        },
      });

      return persona;
    });

    return NextResponse.json(persona, { status: 201 });
  } catch (error) {
    console.error("Error al crear persona:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

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

    const persona = await db.persona.findUnique({
      where: { id },
      include: {
        domicilio: true,
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
    });

    if (!persona) {
      return NextResponse.json(
        { error: "Persona no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(persona);
  } catch (error) {
    console.error("Error al obtener persona:", error);
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

    // Verificar si la persona existe
    const existingPersona = await db.persona.findUnique({
      where: { id },
      include: {
        domicilio: true,
      },
    });

    if (!existingPersona) {
      return NextResponse.json(
        { error: "Persona no encontrada" },
        { status: 404 }
      );
    }

    // Actualizar la persona y su domicilio en una transacción
    const persona = await db.$transaction(async (tx) => {
      // Actualizar la persona
      const persona = await tx.persona.update({
        where: { id },
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

      // Actualizar el domicilio si existe, o crearlo si no existe
      if (existingPersona.domicilio) {
        await tx.domicilio.update({
          where: { id: existingPersona.domicilio.id },
          data: {
            calle,
            numero: numero || null,
            colonia: colonia || null,
            localidad: localidad || null,
            codigoPostal: codigoPostal || null,
            referencias: referencias || null,
            latitud: latitud || null,
            longitud: longitud || null,
            seccionId: seccionId || null,
          },
        });
      } else {
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
      }

      return persona;
    });

    return NextResponse.json(persona);
  } catch (error) {
    console.error("Error al actualizar persona:", error);
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

    // Verificar si la persona existe
    const existingPersona = await db.persona.findUnique({
      where: { id },
    });

    if (!existingPersona) {
      return NextResponse.json(
        { error: "Persona no encontrada" },
        { status: 404 }
      );
    }

    // Eliminar la persona (el domicilio se eliminará automáticamente por la relación)
    await db.persona.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar persona:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

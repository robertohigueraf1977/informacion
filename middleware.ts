import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Temporalmente deshabilitamos la verificación de autenticación
  // hasta que resolvamos el problema con NextAuth
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/personas/:path*",
    "/domicilios/:path*",
    "/municipios/:path*",
    "/distritos/:path*",
    "/secciones/:path*",
    "/sectores/:path*",
    "/casillas/:path*",
    "/candidatos/:path*",
    "/partidos/:path*",
    "/votos/:path*",
    "/tareas/:path*",
    "/usuarios/:path*",
    "/auth/:path*",
  ],
};

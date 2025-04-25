import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { UserRole } from "@prisma/client"

export async function middleware(request: NextRequest) {
  // Obtener el token de sesión
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  // Si no hay token, redirigir al login
  if (!token) {
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", encodeURI(request.nextUrl.pathname))
    return NextResponse.redirect(url)
  }

  const role = token.role as UserRole
  const path = request.nextUrl.pathname

  // Restricciones para rutas de usuarios (solo SUPER_USER)
  if (path.startsWith("/usuarios") && role !== UserRole.SUPER_USER) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Restricciones para crear personas (solo SUPER_USER, ADMIN y EDITOR)
  if (
    path.startsWith("/personas/crear") &&
    role !== UserRole.SUPER_USER &&
    role !== UserRole.ADMIN &&
    role !== UserRole.EDITOR
  ) {
    return NextResponse.redirect(new URL("/personas", request.url))
  }

  // Restricciones para crear tareas (solo SUPER_USER, ADMIN y EDITOR)
  if (
    path.startsWith("/tareas/crear") &&
    role !== UserRole.SUPER_USER &&
    role !== UserRole.ADMIN &&
    role !== UserRole.EDITOR
  ) {
    return NextResponse.redirect(new URL("/tareas", request.url))
  }

  // Permitir el acceso a las demás rutas
  return NextResponse.next()
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
    "/tareas/:path*",
    "/usuarios/:path*",
  ],
}

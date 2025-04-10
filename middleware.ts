import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Export the middleware with NextAuth authentication
export default withAuth(
  // Customize this function to handle additional logic if needed
  function middleware(req) {
    return NextResponse.next();
  },
  {
    // Customize the authentication behavior if needed
    callbacks: {
      authorized: ({ token }) => !!token, // Only allow authenticated users
    },
  }
);

// Define which routes to protect
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
    // Don't protect auth pages (to avoid redirect loops)
    // "/auth/:path*", 
  ],
};

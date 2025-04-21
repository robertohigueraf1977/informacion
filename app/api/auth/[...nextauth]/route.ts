import NextAuth from "next-auth";
import { authOptions } from "@/auth";

// Create the handler using the NextAuth function
const handler = NextAuth(authOptions);

// Export the handler as named functions for HTTP methods
// This is the recommended approach for Next.js App Router
export { handler as GET, handler as POST }

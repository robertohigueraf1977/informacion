import type { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface User {
    id: string;
    username: string;
    role: UserRole;
  }

  interface Session {
    user: User & {
      id: string;
      username: string;
      role: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    role: string;
  }
}

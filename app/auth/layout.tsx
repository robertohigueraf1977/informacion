import type React from "react";
import { auth } from "@/auth";
import { SessionProvider } from "@/components/session-provider";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      <div className="flex min-h-screen flex-col items-center justify-center py-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </SessionProvider>
  );
}

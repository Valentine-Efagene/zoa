"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!session) {
      // Soft logout / never authenticated — leave the app shell.
      // Terminal expiry uses forceLogout() which hard-navigates with reason=session_expired.
      const params = new URLSearchParams();
      if (pathname && pathname !== "/login") {
        params.set("from", pathname);
      }
      const qs = params.toString();
      router.replace(qs ? `/login?${qs}` : "/login");
    }
  }, [loading, session, router, pathname]);

  if (loading || !session) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
        Redirecting…
      </div>
    );
  }

  return <>{children}</>;
}

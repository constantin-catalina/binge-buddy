// src/components/auth/RequireAdmin.tsx
import React, { useEffect, useState, ReactNode, ReactElement } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { Navigate, useLocation } from "react-router-dom";

type RequireAdminProps = {
  children: ReactNode;
};

const API_BASE: string =
  (import.meta as any).env?.VITE_API_URL ?? "http://localhost:3000";

export default function RequireAdmin({ children }: RequireAdminProps): ReactElement | null {
  const { isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const loc = useLocation();

  const [allowed, setAllowed] = useState<boolean | null>(null); // null=loading

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!isLoaded) return;

      if (!isSignedIn) {
        if (!cancelled) setAllowed(false);
        return;
      }

      try {
        const token = await getToken();
        if (!token) {
          if (!cancelled) setAllowed(false);
          return;
        }

        const res = await fetch(`${API_BASE}/api/admin/check`, {
          headers: { Authorization: `Bearer ${token}` } as Record<string, string>,
        });

        if (!cancelled) setAllowed(res.ok); // 200 => admin
      } catch {
        if (!cancelled) setAllowed(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, getToken]);

  if (!isLoaded || allowed === null) return null;
  if (!isSignedIn) return <Navigate to="/sign-in" state={{ from: loc }} replace />;
  if (!allowed) return <Navigate to="/" replace />;

  return <>{children}</>;
}

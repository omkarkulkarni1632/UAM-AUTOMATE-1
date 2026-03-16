import React from "react";
import { Navigate } from "react-router-dom";
import type { Role } from "./roles";
import { useAuth } from "./AuthContext";

export function RequireRole({
  roles,
  children,
}: {
  roles: Role[];
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  return <>{children}</>;
}


import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../../config/env";
import { Role } from "../../../domain/constants/rbac";

export interface RequestUser {
  id: string;
  role: Role;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: RequestUser;
  }
}

export function authRequired(req: Request, res: Response, next: NextFunction) {
  const header = req.header("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";
  if (!token) return res.status(401).json({ error: "UNAUTHENTICATED" });

  try {
    const payload = jwt.verify(token, env.jwtSecret) as { sub: string; role: Role };
    req.user = { id: payload.sub, role: payload.role };
    return next();
  } catch {
    return res.status(401).json({ error: "UNAUTHENTICATED" });
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: "UNAUTHENTICATED" });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: "FORBIDDEN" });
    return next();
  };
}


import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { Role } from "../../domain/constants/rbac";
import { UserRepository } from "../../domain/repositories/UserRepository";

export interface AuthTokenPayload {
  sub: string;
  role: Role;
}

export class AuthService {
  constructor(private readonly users: UserRepository) {}

  async login(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user || !user.passwordHash) throw new Error("Invalid credentials");
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new Error("Invalid credentials");

    const payload: AuthTokenPayload = { sub: user.id, role: user.role };
    const token = jwt.sign(payload, env.jwtSecret, { expiresIn: "12h" });
    return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  }
}


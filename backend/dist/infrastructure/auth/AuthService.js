"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../config/env");
class AuthService {
    users;
    constructor(users) {
        this.users = users;
    }
    async login(email, password) {
        const user = await this.users.findByEmail(email);
        if (!user || !user.passwordHash)
            throw new Error("Invalid credentials");
        const ok = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!ok)
            throw new Error("Invalid credentials");
        const payload = { sub: user.id, role: user.role };
        const token = jsonwebtoken_1.default.sign(payload, env_1.env.jwtSecret, { expiresIn: "12h" });
        return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
    }
}
exports.AuthService = AuthService;

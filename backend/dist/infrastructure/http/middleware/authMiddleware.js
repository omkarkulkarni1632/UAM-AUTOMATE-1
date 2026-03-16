"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRequired = authRequired;
exports.requireRole = requireRole;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../../config/env");
function authRequired(req, res, next) {
    const header = req.header("authorization") ?? "";
    const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";
    if (!token)
        return res.status(401).json({ error: "UNAUTHENTICATED" });
    try {
        const payload = jsonwebtoken_1.default.verify(token, env_1.env.jwtSecret);
        req.user = { id: payload.sub, role: payload.role };
        return next();
    }
    catch {
        return res.status(401).json({ error: "UNAUTHENTICATED" });
    }
}
function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user)
            return res.status(401).json({ error: "UNAUTHENTICATED" });
        if (!roles.includes(req.user.role))
            return res.status(403).json({ error: "FORBIDDEN" });
        return next();
    };
}

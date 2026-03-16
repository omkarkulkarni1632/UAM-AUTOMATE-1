"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDb = getDb;
const knex_1 = __importDefault(require("knex"));
const env_1 = require("../../config/env");
let db = null;
function getDb() {
    if (db)
        return db;
    if (!env_1.env.databaseUrl) {
        throw new Error("DATABASE_URL is required for database access (e.g. postgres://user:pass@host:5432/db)");
    }
    db = (0, knex_1.default)({
        client: "pg",
        connection: env_1.env.databaseUrl,
        pool: { min: 0, max: 10 },
    });
    return db;
}

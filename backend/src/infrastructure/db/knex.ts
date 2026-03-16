import knex, { Knex } from "knex";
import { env } from "../../config/env";

let db: Knex | null = null;

export function getDb(): Knex {
  if (db) return db;
  if (!env.databaseUrl) {
    throw new Error(
      "DATABASE_URL is required for database access (e.g. postgres://user:pass@host:5432/db)"
    );
  }

  db = knex({
    client: "pg",
    connection: env.databaseUrl,
    pool: { min: 0, max: 10 },
  });

  return db;
}


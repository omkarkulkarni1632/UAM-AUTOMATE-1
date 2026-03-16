/**
 * @param {import("knex").Knex} knex
 */
exports.up = async function up(knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');

  await knex.schema.createTable("departments", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.text("name").notNullable().unique();
    t.uuid("department_head").nullable();
  });

  await knex.schema.createTable("users", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.text("name").notNullable();
    t.text("email").notNullable().unique();
    t.uuid("department_id").nullable().references("id").inTable("departments");
    t.text("role").notNullable();
    t.uuid("manager_id").nullable().references("id").inTable("users");
    t.text("employment_status").notNullable();
    t.text("password_hash").nullable();
    t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.alterTable("departments", (t) => {
    t.foreign("department_head").references("users.id");
  });

  await knex.schema.createTable("permissions", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.text("permission_name").notNullable();
    t.text("system").notNullable();
    t.integer("privilege_level").notNullable();
    t.boolean("is_sensitive_system").notNullable().defaultTo(false);
    t.unique(["permission_name", "system"]);
  });

  await knex.schema.createTable("user_access", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.uuid("user_id").notNullable().references("users.id");
    t.uuid("permission_id").notNullable().references("permissions.id");
    t.uuid("granted_by").notNullable().references("users.id");
    t.text("status").notNullable();
    t.timestamp("granted_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.timestamp("last_used_at", { useTz: true }).nullable();
    t.index(["user_id"]);
    t.index(["permission_id"]);
    t.index(["status"]);
  });

  await knex.schema.createTable("access_requests", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.uuid("user_id").notNullable().references("users.id");
    t.uuid("requested_by").notNullable().references("users.id");
    t.text("request_type").notNullable();
    t.text("current_stage").notNullable();
    t.text("status").notNullable();
    t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.index(["current_stage"]);
    t.index(["status"]);
    t.index(["user_id"]);
  });

  await knex.schema.createTable("role_templates", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.text("role_name").notNullable();
    t.uuid("department_id").nullable().references("departments.id");
    t.jsonb("default_permissions").notNullable().defaultTo(knex.raw("'[]'::jsonb"));
    t.unique(["role_name", "department_id"]);
  });

  await knex.schema.createTable("audit_logs", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.uuid("user_id").nullable().references("users.id");
    t.text("action").notNullable();
    t.uuid("performed_by").notNullable().references("users.id");
    t.timestamp("timestamp", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.jsonb("details").notNullable().defaultTo(knex.raw("'{}'::jsonb"));
    t.index(["timestamp"]);
    t.index(["action"]);
    t.index(["user_id"]);
  });

  await knex.schema.createTable("risk_scores", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.uuid("user_id").notNullable().references("users.id");
    t.integer("score").notNullable();
    t.timestamp("calculated_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.jsonb("factors").notNullable().defaultTo(knex.raw("'{}'::jsonb"));
    t.index(["user_id"]);
    t.index(["score"]);
  });
};

/**
 * @param {import("knex").Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("risk_scores");
  await knex.schema.dropTableIfExists("audit_logs");
  await knex.schema.dropTableIfExists("role_templates");
  await knex.schema.dropTableIfExists("access_requests");
  await knex.schema.dropTableIfExists("user_access");
  await knex.schema.dropTableIfExists("permissions");
  await knex.schema.dropTableIfExists("users");
  await knex.schema.dropTableIfExists("departments");
};


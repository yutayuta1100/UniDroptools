import "server-only";

import postgres from "postgres";

let sqlInstance: postgres.Sql | null = null;

export type DatabaseClient = postgres.Sql;
export type DatabaseTransaction = postgres.TransactionSql;
export type DatabaseExecutor = DatabaseClient | DatabaseTransaction;

export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

export function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (!sqlInstance) {
    sqlInstance = postgres(process.env.DATABASE_URL, {
      max: 5,
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false,
    });
  }

  return sqlInstance;
}

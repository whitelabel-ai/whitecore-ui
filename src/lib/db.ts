import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = process.env.DATABASE_URL?.replace('file:', '') || path.join(process.cwd(), 'local.db');

export const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      industry TEXT,
      size TEXT,
      country TEXT,
      tax_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('superadmin', 'company_admin', 'company_user')),
      company_id TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (company_id) REFERENCES companies(id)
    );

    CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_id);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

    CREATE TABLE IF NOT EXISTS diagnostic_cases (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('draft', 'in_progress', 'completed', 'archived')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (company_id) REFERENCES companies(id)
    );

    CREATE TABLE IF NOT EXISTS area_contexts (
      id TEXT PRIMARY KEY,
      diagnostic_case_id TEXT NOT NULL,
      area_key TEXT NOT NULL CHECK(area_key IN ('general', 'strategy', 'operations', 'finance', 'technology', 'human-resources', 'marketing-sales', 'legal')),
      data_json TEXT NOT NULL DEFAULT '{}',
      problems_json TEXT NOT NULL DEFAULT '[]',
      opportunities TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (diagnostic_case_id) REFERENCES diagnostic_cases(id),
      UNIQUE(diagnostic_case_id, area_key)
    );

    CREATE TABLE IF NOT EXISTS area_context_audits (
      id TEXT PRIMARY KEY,
      area_context_id TEXT NOT NULL,
      diagnostic_case_id TEXT NOT NULL,
      company_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      user_name TEXT,
      area_key TEXT NOT NULL,
      action TEXT NOT NULL CHECK(action IN ('create', 'update')),
      created_at TEXT NOT NULL,
      FOREIGN KEY (area_context_id) REFERENCES area_contexts(id),
      FOREIGN KEY (diagnostic_case_id) REFERENCES diagnostic_cases(id),
      FOREIGN KEY (company_id) REFERENCES companies(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_diagnostic_cases_company ON diagnostic_cases(company_id);
    CREATE INDEX IF NOT EXISTS idx_area_contexts_case ON area_contexts(diagnostic_case_id);
    CREATE INDEX IF NOT EXISTS idx_audits_company ON area_context_audits(company_id);
    CREATE INDEX IF NOT EXISTS idx_audits_case ON area_context_audits(diagnostic_case_id);
    CREATE INDEX IF NOT EXISTS idx_audits_created ON area_context_audits(created_at DESC);
  `);
}

initDb();

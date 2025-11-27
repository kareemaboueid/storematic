const fs = require("fs");
const path = require("path");
const config_logger = require("../config/logger.config");
const { database_get_client } = require("./db_client.database");

// Folder where your .sql migrations live
const MIGRATIONS_FOLDER = path.join(__dirname, "../../db/migrations");

/**
 * Ensure the migration tracking table exists.
 * This table tracks which migration files have been applied.
 */
const database_ensure_migration_table = async (p_client) => {
  const create_table_sql = `
    CREATE TABLE IF NOT EXISTS DB_MIGRATION (
      DB_MIGRATION_ID SERIAL PRIMARY KEY,
      FILE_NAME TEXT NOT NULL UNIQUE,
      APPLIED_AT TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await p_client.query(create_table_sql);
};

/**
 * Get the set of already applied migration file names.
 */
const database_get_applied_migrations = async (p_client) => {
  const result = await p_client.query(`
    SELECT FILE_NAME
    FROM DB_MIGRATION
    ORDER BY APPLIED_AT;
  `);

  const applied_set = new Set(result.rows.map((p_row) => p_row.file_name));
  return applied_set;
};

/**
 * Read migration files from folder and return sorted file names.
 */
const database_get_all_migration_files = () => {
  const files = fs
    .readdirSync(MIGRATIONS_FOLDER)
    .filter((p_file) => p_file.endsWith(".sql"))
    .sort(); // alphabetical order → chronological if prefixed with date

  return files;
};

/**
 * Apply a single migration file in a transaction.
 */
const database_apply_migration = async (p_client, p_file_name) => {
  const file_path = path.join(MIGRATIONS_FOLDER, p_file_name);
  const sql = fs.readFileSync(file_path, "utf8");

  if (!sql.trim()) {
    config_logger.warn(`Skipping empty migration file: ${p_file_name}`);
    return;
  }

  config_logger.info(`Applying migration: ${p_file_name}`);

  try {
    await p_client.query("BEGIN");
    await p_client.query(sql); // can contain multiple statements separated by ;
    await p_client.query(
      `
        INSERT INTO DB_MIGRATION (FILE_NAME)
        VALUES ($1)
      `,
      [p_file_name],
    );
    await p_client.query("COMMIT");
    config_logger.info(`Migration applied successfully: ${p_file_name}`);
  } catch (p_error) {
    await p_client.query("ROLLBACK");
    config_logger.error(`Failed to apply migration ${p_file_name}: ${p_error.message}`);
    throw p_error;
  }
};

/**
 * Main runner: apply all pending migrations.
 */
const database_run_migrations = async () => {
  const client = await database_get_client();

  try {
    await database_ensure_migration_table(client);

    const applied_migrations = await database_get_applied_migrations(client);
    const all_files = database_get_all_migration_files();

    const pending_files = all_files.filter((p_file_name) => !applied_migrations.has(p_file_name));

    if (pending_files.length === 0) {
      config_logger.info("No pending database migrations.");
      return;
    }

    config_logger.info(`Pending migrations: ${pending_files.join(", ")}`);

    for (const migration_file of pending_files) {
      await database_apply_migration(client, migration_file);
    }

    config_logger.info("All pending migrations applied successfully.");
  } catch (p_error) {
    config_logger.error(`Database migration failed: ${p_error.message}`);
    process.exitCode = 1;
  } finally {
    client.release();
  }
};

// Run when called directly via `node src/database/migrate.database.js`
if (require.main === module) {
  database_run_migrations().catch((p_error) => {
    config_logger.error(`Migration script failed: ${p_error.message}`);
    process.exit(1);
  });
}

module.exports = {
  database_run_migrations,
};

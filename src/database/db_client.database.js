const { Pool } = require("pg");
const config_env = require("../config/env.config");
const config_logger = require("../config/logger.config");

// Create a shared connection pool for the whole app
const database_pool = new Pool({
  connectionString: config_env.postgresql.url,
});

// Handle unexpected errors on idle clients
database_pool.on("error", (p_error) => {
  config_logger.error(`Unexpected PostgreSQL client error: ${p_error.message}`);
});

/**
 * Convenience helper for simple queries (no manual client handling).
 * @param {string} p_text - SQL query text
 * @param {Array} [p_params] - query parameters
 * @returns {Promise<import('pg').QueryResult>}
 */
const database_query = (p_text, p_params = []) => {
  return database_pool.query(p_text, p_params);
};

/**
 * Get a dedicated client from the pool (for transactions).
 * Remember to call client.release() when you are done.
 * @returns {Promise<import('pg').PoolClient>}
 */
const database_get_client = async () => {
  const client = await database_pool.connect();
  return client;
};

const database_client = {
  database_pool,
  database_query,
  database_get_client,
};

module.exports = database_client;

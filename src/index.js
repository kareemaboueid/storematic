// src/index.js
const storematic_app = require("./storematic");
const config_env = require("./config/env.config");
const config_logger = require("./config/logger.config");
const { database_query } = require("./database/db-client.database");

let server;

/**
 * Initialize database connection and start HTTP server
 */
const run_server = async () => {
  try {
    // 1. Check DB connectivity before starting the HTTP server
    await database_query("SELECT 1 AS DB_OK");

    config_logger.info(`Connected to PostgreSQL database`);

    // 2. Only start server if DB is OK
    server = storematic_app.listen(config_env.port, () => {
      config_logger.info(
        `Storematic App running (Port: ${config_env.port} - Env: ${config_env.env})`,
      );
    });

    // 3. Handle server listen errors
    server.on("error", (p_error) => {
      if (
        p_error.code === "EADDRINUSE" ||
        p_error.code === "EACCES" ||
        p_error.code === "ENOTFOUND"
      ) {
        config_logger.error(`Failed to start server: ${p_error.message}`);
      } else {
        config_logger.error(`Unexpected server listen error: ${p_error.message}`);
      }
      process.exit(1);
    });
  } catch (p_error) {
    // If DB connection fails, don't start the HTTP server at all
    config_logger.error(`Failed to connect to PostgreSQL database: ${p_error.message}`);
    process.exit(1);
  }
};

const server_exit_handler = (is_error = false) => {
  if (server) {
    server.close(() => {
      config_logger.info("Server closed");
      process.exit(is_error ? 1 : 0);
    });
  } else {
    process.exit(is_error ? 1 : 0);
  }
};

const server_unexpected_error_handler = (p_error) => {
  config_logger.error(`Unexpected server error: ${p_error}`);
  server_exit_handler(true);
};

process.on("uncaughtException", server_unexpected_error_handler);
process.on("unhandledRejection", server_unexpected_error_handler);

process.on("SIGTERM", () => {
  config_logger.info("SIGTERM received");
  if (server) {
    server.close();
  }
});

run_server();

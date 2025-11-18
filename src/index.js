const storematic_app = require("./storematic");
const config_env = require("./config/env.config");
const config_logger = require("./config/logger.config");

const server = storematic_app.listen(config_env.port, () => {
  config_logger.info(`Storematic App running (Port: ${config_env.port} - Env: ${config_env.env})`);
});

// Handle server listen errors
server.on("error", (p_error) => {
  if (p_error.code === "EADDRINUSE" || p_error.code === "EACCES" || p_error.code === "ENOTFOUND") {
    config_logger.error(`Failed to start server: ${p_error.message}`);
  }
  process.exit(1);
});

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

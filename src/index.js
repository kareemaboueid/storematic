const storematic_app = require("./storematic");
const env = require("./config/env.config");
const logger = require("./config/logger.config");

let server;

server = storematic_app.listen(env.port, () => {
  logger.info(
    `Storematic App running | Port: ${env.port} | Environment: ${env.env}`
  );
});

// Handle server listen errors
server.on("error", (error) => {
  if (
    error.code === "EADDRINUSE" ||
    error.code === "EACCES" ||
    error.code === "ENOTFOUND"
  ) {
    logger.error(`Failed to start server: ${error.message}`);
  }
  process.exit(1);
});

const server_exit_handler = (is_error = false) => {
  if (server) {
    server.close(() => {
      logger.info("Server closed");
      process.exit(is_error ? 1 : 0);
    });
  } else {
    process.exit(is_error ? 1 : 0);
  }
};

const server_unexpected_error_handler = (error) => {
  logger.error(`Unexpected server error: ${error}`);
  server_exit_handler(true);
};

process.on("uncaughtException", server_unexpected_error_handler);
process.on("unhandledRejection", server_unexpected_error_handler);

process.on("SIGTERM", () => {
  logger.info("SIGTERM received");
  if (server) {
    server.close();
  }
});

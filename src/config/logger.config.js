const winston = require("winston");
const config_env = require("./env.config");

// Custom format to enumerate error stack traces
const enumerate_error_format = winston.format((p_info) => {
  if (p_info instanceof Error) {
    Object.assign(p_info, { message: p_info.stack });
  }
  return p_info;
});

// Create the logger instance
const config_logger = winston.createLogger({
  level: config_env.env === "development" ? "debug" : "info",
  format: winston.format.combine(
    enumerate_error_format(),
    config_env.env === "development" ? winston.format.colorize() : winston.format.uncolorize(),
    winston.format.splat(),
    winston.format.printf(({ level, message }) => `${level}: ${message}`),
  ),
  transports: [
    new winston.transports.Console({
      stderrLevels: ["error"],
    }),
  ],
});

module.exports = config_logger;

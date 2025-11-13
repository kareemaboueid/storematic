const winston = require("winston");
const env = require("./env.config");

// Custom format to enumerate error stack traces
const enumerate_error_format = winston.format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack });
  }
  return info;
});

// Create the logger instance
const logger = winston.createLogger({
  level: env.env === "development" ? "debug" : "info",
  format: winston.format.combine(
    enumerate_error_format(),
    env.env === "development"
      ? winston.format.colorize()
      : winston.format.uncolorize(),
    winston.format.splat(),
    winston.format.printf(({ level, message }) => `${level}: ${message}`)
  ),
  transports: [
    new winston.transports.Console({
      stderrLevels: ["error"],
    }),
  ],
});

module.exports = logger;
